"""
Placeholder
"""
import base64
import json
import logging

import boto3
import tornado
from botocore.exceptions import NoCredentialsError
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
from pathlib import Path

import s3fs


def create_s3_resource(config):

    if config.endpoint_url and config.client_id and config.client_secret:

        return s3fs.S3FileSystem(
            key=config.client_id,
            secret=config.client_secret,
            token=config.session_token,
            client_kwargs={"endpoint_url": config.endpoint_url},
        )

    else:
        return s3fs.S3FileSystem()


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
    Returns true if the user has access to an aws S3 bucket
    """

    # avoid making requests to AWS if the user's ~/.aws/credentials file has credentials for a different provider,
    # e.g. https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-aws-cli#aws-cli-config
    aws_credentials_file = Path("{}/.aws/credentials".format(Path.home()))
    if aws_credentials_file.exists():
        with aws_credentials_file.open() as credentials_file:
            for line in credentials_file.readlines():
                if line.startswith("aws_access_key_id"):
                    access_key_id = line.split("=", 1)[1]
                    # aws keys reliably start with AKIA for long-term or ASIA for short-term
                    if not access_key_id.startswith(
                        "AKIA"
                    ) and not access_key_id.startswith("ASIA"):
                        # if any keys are not valid AWS keys, don't try to authenticate
                        logging.info(
                            "Found invalid AWS aws_access_key_id in ~/.aws/credentials file, "
                            "will not attempt to authenticate through ~/.aws/credentials."
                        )
                        return False

    try:
        _test_aws_s3_role_access()
        return True
    except NoCredentialsError:
        return False
    except Exception as e:
        logging.error(e)
        return False


def test_s3_credentials(endpoint_url, client_id, client_secret, session_token):
    """
    Checks if we're able to list buckets with these credentials.
    If not, it throws an exception.
    """
    logging.debug("testing s3 credentials")
    test = boto3.resource(
        "s3",
        aws_access_key_id=client_id,
        aws_secret_access_key=client_secret,
        endpoint_url=endpoint_url,
        aws_session_token=session_token,
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

    @property
    def config(self):
        return self.settings["s3_config"]

    @tornado.web.authenticated
    def get(self, path=""):
        """
        Checks if the user is already authenticated
        against an s3 instance.
        """
        authenticated = False
        if has_aws_s3_role_access():
            authenticated = True

        if not authenticated:

            try:
                config = self.config
                if config.endpoint_url and config.client_id and config.client_secret:
                    test_s3_credentials(
                        config.endpoint_url,
                        config.client_id,
                        config.client_secret,
                        config.session_token,
                    )
                    logging.debug("...successfully authenticated")

                    # If no exceptions were encountered during testS3Credentials,
                    # then assume we're authenticated
                    authenticated = True

            except Exception as err:
                # If an exception was encountered,
                # assume that we're not yet authenticated
                # or invalid credentials were provided
                logging.debug("...failed to authenticate")
                logging.debug(err)

        self.finish(json.dumps({"authenticated": authenticated}))

    @tornado.web.authenticated
    def post(self, path=""):
        """
        Sets s3 credentials.
        """

        try:
            req = json.loads(self.request.body)
            endpoint_url = req["endpoint_url"]
            client_id = req["client_id"]
            client_secret = req["client_secret"]
            session_token = req["session_token"]

            test_s3_credentials(endpoint_url, client_id, client_secret, session_token)

            self.config.endpoint_url = endpoint_url
            self.config.client_id = client_id
            self.config.client_secret = client_secret
            self.config.session_token = session_token

            self.finish(json.dumps({"success": True}))
        except Exception as err:
            self.finish(json.dumps({"success": False, "message": str(err)}))


class S3ResourceNotFoundException(Exception):
    pass


def convertS3FStoJupyterFormat(result):
    return {
        "name": result["Key"].rsplit("/", 1)[-1],
        "path": result["Key"],
        "type": result["type"],
    }


class S3Handler(APIHandler):
    """
    Handles requests for getting S3 objects
    """

    @property
    def config(self):
        return self.settings["s3_config"]

    s3fs = None

    @tornado.web.authenticated
    def get(self, path=""):
        """
        Takes a path and returns lists of files/objects
        and directories/prefixes based on the path.
        """
        logging.info("GET: {}".format(path))

        try:
            if not self.s3fs:
                self.s3fs = create_s3_resource(self.config)

            if (path and not path.endswith("/")) and (
                "X-Custom-S3-Is-Dir" not in self.request.headers
            ):  # TODO: replace with function
                logging.info("getting file contents")
                newpath = path[1:]
                with self.s3fs.open(newpath, "rb") as f:
                    result = {
                        "path": newpath,
                        "type": "file",
                        "content": base64.encodebytes(f.read()).decode("ascii"),
                    }
            else:
                logging.info("getting directory contents")
                logging.info(self.s3fs.listdir(path))
                raw_result = list(
                    map(convertS3FStoJupyterFormat, self.s3fs.listdir(path))
                )
                result = list(filter(lambda x: x["name"] != "", raw_result))

        except S3ResourceNotFoundException as e:
            logging.info(e)
            result = {
                "error": 404,
                "message": "The requested resource could not be found.",
            }
        except Exception as e:
            logging.error("what happened during get?")
            logging.error(e)
            result = {"error": 500, "message": str(e)}

        logging.info(result)
        self.finish(json.dumps(result))

    @tornado.web.authenticated
    def put(self, path=""):
        """
        Takes a path and returns lists of files/objects
        and directories/prefixes based on the path.
        """
        path = path[1:]
        logging.info("PUT: {}".format(path))
        logging.info(self.request.headers)

        result = {}

        try:
            if not self.s3fs:
                self.s3fs = create_s3_resource(self.config)

            if "X-Custom-S3-Src" in self.request.headers:
                source = self.request.headers["X-Custom-S3-Src"]
                logging.info("copying from {}".format(source))
                self.s3fs.cp(source, path)
                # why read again?
                with self.s3fs.open(path, "rb") as f:
                    result = {
                        "path": path,
                        "type": "file",
                        "content": base64.encodebytes(f.read()).decode("ascii"),
                    }
            elif "X-Custom-S3-Is-Dir" in self.request.headers:
                logging.info("creating new dir: {}".format(path))
                self.s3fs.mkdir(path)
                logging.info("CREATED!")
            elif self.request.body:
                request = json.loads(self.request.body)
                with self.s3fs.open(path, "w") as f:
                    f.write(request["content"])

        except S3ResourceNotFoundException as e:
            logging.info(e)
            result = {
                "error": 404,
                "message": "The requested resource could not be found.",
            }
        except Exception as e:
            logging.error("what happened during copy?")
            logging.error(e)
            result = {"error": 500, "message": str(e)}

        self.finish(json.dumps(result))

    @tornado.web.authenticated
    def delete(self, path=""):
        """
        Takes a path and returns lists of files/objects
        and directories/prefixes based on the path.
        """
        path = path[1:]
        logging.info("DELETE: {}".format(path))

        result = {}

        try:
            if not self.s3fs:
                self.s3fs = create_s3_resource(self.config)

            self.s3fs.rm(path)
            logging.info("removed {}".format(path))

        except S3ResourceNotFoundException as e:
            logging.error(e)
            result = {
                "error": 404,
                "message": "The requested resource could not be found.",
            }
        except Exception as e:
            logging.error("what happened?")
            logging.error(e)
            result = {"error": 500, "message": str(e)}

        self.finish(json.dumps(result))


def setup_handlers(web_app):
    host_pattern = ".*"

    base_url = web_app.settings["base_url"]
    handlers = [
        (url_path_join(base_url, "jupyterlab_s3_browser", "auth(.*)"), AuthHandler),
        (url_path_join(base_url, "jupyterlab_s3_browser", "files(.*)"), S3Handler),
    ]
    web_app.add_handlers(host_pattern, handlers)
