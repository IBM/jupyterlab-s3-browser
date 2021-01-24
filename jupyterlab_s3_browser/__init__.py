"""
Placeholder
"""
import base64
import json
import logging
import traceback
from collections import namedtuple
from pathlib import Path
from os import environ

import boto3
import tornado.gen as gen
from botocore.exceptions import NoCredentialsError
from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
from singleton_decorator import singleton
from traitlets import Unicode
from traitlets.config import SingletonConfigurable

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": data["name"]}]


class S3Config(SingletonConfigurable):
    """
    Allows configuration of access to an S3 api
    """

    endpoint_url = Unicode(
        environ.get("JUPYTERLAB_S3_ENDPOINT", ""),
        config=True,
        help="The url for the S3 api",
    )
    client_id = Unicode(
        environ.get("JUPYTERLAB_S3_ACCESS_KEY_ID", ""),
        config=True,
        help="The client ID for the S3 api",
    )
    client_secret = Unicode(
        environ.get("JUPYTERLAB_S3_SECRET_ACCESS_KEY", ""),
        config=True,
        help="The client secret for the S3 api",
    )


@singleton
class S3Resource:  # pylint: disable=too-few-public-methods
    """
    Singleton wrapper around a boto3 resource
    """

    def __init__(self, config):
        logging.error(
            "************************************************************************"
        )
        config = S3Config().instance(config=config)

        if config.endpoint_url and config.client_id and config.client_secret:

            self.s3_resource = boto3.resource(
                "s3",
                aws_access_key_id=config.client_id,
                aws_secret_access_key=config.client_secret,
                endpoint_url=config.endpoint_url,
            )
        else:
            self.s3_resource = boto3.resource("s3")


def _test_env_var_access():
    """
  Checks if we have access to through environment variable configuration
  """
    test = boto3.resource("s3")
    all_buckets = test.buckets.all()
    result = [
        {"name": bucket.name + "/", "path": bucket.name + "/", "type": "directory"}
        for bucket in all_buckets
    ]
    return result


def _test_aws_s3_role_access():
    """
  Checks if we have access to AWS S3 through role-based access
  """
    test = boto3.resource("s3")
    all_buckets = test.buckets.all()
    result = [
        {"name": bucket.name + "/", "path": bucket.name + "/", "type": "directory"}
        for bucket in all_buckets
    ]
    return result


def has_aws_s3_role_access():
    """
    Returns true if the user has access to an S3 bucket
    """
    try:
        _test_aws_s3_role_access()
        return True
    except NoCredentialsError:
        return False


def test_s3_credentials(endpoint_url, client_id, client_secret):
    """
    Checks if we're able to list buckets with these credentials.
    If not, it throws an exception.
    """
    test = boto3.resource(
        "s3",
        aws_access_key_id=client_id,
        aws_secret_access_key=client_secret,
        endpoint_url=endpoint_url,
    )
    all_buckets = test.buckets.all()
    logging.debug(
        [
            {"name": bucket.name + "/", "path": bucket.name + "/", "type": "directory"}
            for bucket in all_buckets
        ]
    )


class AuthHandler(APIHandler):  # pylint: disable=abstract-method
    """
    handle api requests to change auth info
    """

    @gen.coroutine
    def get(self, path=""):
        """
        Checks if the user is already authenticated
        against an s3 instance.
        """
        authenticated = False
        try:
            _test_aws_s3_role_access()
            # if no exceptions, assume authenticated
            authenticated = True
        except Exception as err:
            logging.error(err)
        try:
            _test_aws_s3_role_access()
            # if no exceptions, assume authenticated
            authenticated = True
        except Exception as err:
            logging.error(err)

        if not authenticated:

            try:
                # hmm
                config = S3Config.instance()
                if not has_aws_s3_role_access():
                    config.endpoint_url = environ.get("JUPYTERLAB_S3_ENDPOINT", "")
                    config.client_id = environ.get("JUPYTERLAB_S3_ACCESS_KEY_ID", "")
                    config.client_secret = environ.get(
                        "JUPYTERLAB_S3_SECRET_ACCESS_KEY", ""
                    )
                if config.endpoint_url and config.client_id and config.client_secret:
                    logging.warning("Testing s3 credentials")
                    logging.warning(config.endpoint_url)
                    logging.warning(config.client_id)
                    logging.warning(config.client_secret)
                    test_s3_credentials(
                        config.endpoint_url, config.client_id, config.client_secret
                    )
                    logging.warning("AUTHENTICATED!")

                    # If no exceptions were encountered during testS3Credentials,
                    # then assume we're authenticated
                    authenticated = True

            except Exception as err:
                # If an exception was encountered,
                # assume that we're not yet authenticated
                # or invalid credentials were provided
                logging.warning("FAILED TO AUTHENTICATE")
                logging.warning(err)

        self.finish(json.dumps({"authenticated": authenticated}))

    @gen.coroutine
    def post(self, path=""):
        """
        Sets s3 credentials.
        """

        try:
            req = json.loads(self.request.body)
            endpoint_url = req["endpoint_url"]
            client_id = req["client_id"]
            client_secret = req["client_secret"]

            test_s3_credentials(endpoint_url, client_id, client_secret)

            c = S3Config.instance()
            c.endpoint_url = endpoint_url
            c.client_id = client_id
            c.client_secret = client_secret
            S3Resource(self.config)

            self.finish(json.dumps({"success": True}))
        except Exception as err:
            self.finish(json.dumps({"success": False, "message": str(err)}))


class S3ResourceNotFoundException(Exception):
    pass


# TODO: use this
#  @dataclass
#  class S3GetResult:
#  name: str
#  type: str
#  path: str


def parse_bucket_name_and_path(raw_path):
    if "/" not in raw_path[1:]:
        bucket_name = raw_path[1:]
        path = ""
    else:
        bucket_name, path = raw_path[1:].split("/", 1)
    return (bucket_name, path)


Content = namedtuple("Content", ["name", "path", "type", "mimetype"])


# call with
# request_prefix: the prefix we sent to s3 with the request
# response_prefix: full path of object or directory as returned by s3
# returns:
# subtracts the request_prefix from response_prefix and returns
# the basename of request_prefix
# e.g.
# request_prefix=rawtransactions/2020-04-01
# response_prefix=rawtransactions/2020-04-01/file1
# this method returns file1
def get_basename(request_prefix, response_prefix):
    request_prefix_len = len(request_prefix)
    response_prefix_len = len(response_prefix)
    response_prefix = response_prefix[request_prefix_len:response_prefix_len]
    if response_prefix.endswith("/"):
        response_prefix_len = len(response_prefix) - 1
        response_prefix = response_prefix[0:response_prefix_len]
    return response_prefix


def do_list_objects_v2(s3client, bucket_name, prefix):
    list_of_objects = []
    list_of_directories = []
    try:
        response = s3client.list_objects_v2(
            Bucket=bucket_name, Delimiter="/", EncodingType="url", Prefix=prefix,
        )
        if "Contents" in response:
            contents = response["Contents"]
            for one_object in contents:
                obj_key = one_object["Key"]
                obj_key_basename = get_basename(prefix, obj_key)
                if len(obj_key_basename) > 0:
                    list_of_objects.append(
                        Content(obj_key_basename, obj_key, "file", "json")
                    )
        if "CommonPrefixes" in response:
            common_prefixes = response["CommonPrefixes"]
            for common_prefix in common_prefixes:
                prfx = common_prefix["Prefix"]
                prfx_basename = get_basename(prefix, prfx)
                list_of_directories.append(
                    Content(prfx_basename, prfx, "directory", "json")
                )
    except Exception as e:
        logging.error(e)
        traceback.print_exc()

    return list_of_objects, list_of_directories


def do_get_object(s3client, bucket_name, path):
    try:
        response = s3client.get_object(Bucket=bucket_name, Key=path)
        if "Body" in response:
            if "ContentType" in response:
                content_type = response["ContentType"]
            else:
                content_type = "Unknown"
            streaming_body = response["Body"]
            data = streaming_body.read()
            return content_type, data
        else:
            return None
    except Exception as e:
        logging.error(e)
        traceback.print_exc()
        return None


def get_s3_objects_from_path(s3, path):

    if path == "/":
        # requesting the root path, just return all buckets
        all_buckets = s3.buckets.all()
        result = [
            {"name": bucket.name, "path": bucket.name, "type": "directory"}
            for bucket in all_buckets
        ]
        return result
    else:
        bucket_name, path = parse_bucket_name_and_path(path)
        s3client = s3.meta.client
        if path == "" or path.endswith("/"):
            list_of_objects, list_of_directories = do_list_objects_v2(
                s3client, bucket_name, path
            )
            result = set()
            if len(list_of_directories) > 0:
                for one_dir in list_of_directories:
                    result.add(one_dir)
            if len(list_of_objects) > 0:
                for one_object in list_of_objects:
                    result.add(one_object)

            result = list(result)
            result = [
                {
                    "name": content.name,
                    "path": "{}/{}".format(bucket_name, content.path),
                    "type": content.type,
                    "mimetype": content.mimetype,
                }
                for content in result
            ]
            return result
        else:
            object_content_type, object_data = do_get_object(
                s3client, bucket_name, path
            )
            if object_content_type is not None:
                result = {
                    "path": "{}/{}".format(bucket_name, path),
                    "type": "file",
                    "mimetype": object_content_type,
                }
                result["content"] = base64.encodebytes(object_data).decode("ascii")
                return result
            else:
                result = {
                    "error": 404,
                    "message": "The requested resource could not be found.",
                }


class S3Handler(APIHandler):
    """
    Handles requests for getting S3 objects
    """

    s3 = None  # an S3Resource instance to be used for requests

    @gen.coroutine
    def get(self, path=""):
        """
        Takes a path and returns lists of files/objects
        and directories/prefixes based on the path.
        """
        logging.info("GET: {}".format(path))

        #  boto3.set_stream_logger("boto3.resources", logging.DEBUG)
        #  boto3.set_stream_logger("botocore", logging.DEBUG)
        try:
            if not self.s3:
                self.s3 = S3Resource(self.config).s3_resource
            result = get_s3_objects_from_path(self.s3, path)
        except S3ResourceNotFoundException as e:
            logging.info(e)
            result = {
                "error": 404,
                "message": "The requested resource could not be found.",
            }
        except Exception as e:
            logging.error(e)
            result = {"error": 500, "message": str(e)}

        self.finish(json.dumps(result))


def _jupyter_server_extension_points():
    return [{"module": "jupyterlab_s3_browser"}]


def _jupyter_server_extension_paths():
    return [{"module": "jupyterlab_s3_browser"}]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication):
        handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    base_url = web_app.settings["base_url"]
    endpoint = url_path_join(base_url, "jupyterlab_s3_browser")
    handlers = [
        (url_path_join(endpoint, "auth") + "(.*)", AuthHandler),
        (url_path_join(endpoint, "files") + "(.*)", S3Handler),
    ]
    web_app.add_handlers(".*$", handlers)


def _load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication):
        handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    base_url = web_app.settings["base_url"]
    endpoint = url_path_join(base_url, "jupyterlab_s3_browser")
    handlers = [
        (url_path_join(endpoint, "auth") + "(.*)", AuthHandler),
        (url_path_join(endpoint, "files") + "(.*)", S3Handler),
    ]
    web_app.add_handlers(".*$", handlers)
