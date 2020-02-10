import re
import json
import copy
import base64
from collections import namedtuple

import tornado.gen as gen
from tornado.httputil import url_concat
from tornado.httpclient import AsyncHTTPClient, HTTPRequest, HTTPError

from traitlets import Unicode, Bool
from traitlets.config import Configurable, SingletonConfigurable

from notebook.utils import url_path_join, url_escape
from notebook.base.handlers import APIHandler

import boto3
from singleton_decorator import singleton


class S3Resource:
    """
    Singleton wrapper around a boto3 resource
    """

    def __init__(self, config):

        #c = S3Config().instance(config=config)
        self.s3_resource = boto3.resource(
            's3'
        )


class AuthHandler(APIHandler):
    """
    handle api requests to change auth info
    """
    @gen.coroutine
    def get(self, path=''):
        """
        Checks if the user is already authenticated
        against an s3 instance.
        """

        try:
            #c = S3Config.instance()
            self.finish(json.dumps({
                    'authenticated': True
                }))

        except Exception as err:
            # If an exception was encountered,
            # assume that we're not yet authenticated
            # or invalid credentials were provided
            self.finish(json.dumps({
                'authenticated': False
            }))

    @gen.coroutine
    def post(self, path=''):
        """
        Sets s3 credentials.
        """

        try:
            #c = S3Config.instance()
            c = S3Config.instance()
            S3Resource(self.config)

            self.finish(json.dumps({
                'success': True
            }))
        except Exception as err:
            self.finish(json.dumps({
                'success': False,
                'message': str(err)
            }))


class S3Handler(APIHandler):
    """
    Handles requests for getting S3 objects
    """

    s3 = None  # an S3Resource instance to be used for requests

    def parse_bucket_name_and_path(self, raw_path):
        if "/" not in raw_path[1:]:
            bucket_name = raw_path[1:]
            path = ""
        else:
            bucket_name, path = raw_path[1:].split('/', 1)
        return (bucket_name, path)

    @gen.coroutine
    def get(self, path=''):
        """
        Takes a path and returns lists of files/objects
        and directories/prefixes based on the path.
        """

        try:
            if not self.s3:
                self.s3 = S3Resource(self.config).s3_resource

            if path == "/":
                # requesting the root path, just return all buckets
                all_buckets = self.s3.buckets.all()
                result = [{
                    'name': bucket.name,
                    'path': bucket.name,
                    'type': 'directory'
                } for bucket in all_buckets]
            else:
                bucket_name, path = self.parse_bucket_name_and_path(path)
                bucket = self.s3.Bucket(bucket_name)
                objects = list(bucket.objects.filter(Prefix=path))
                num_matches = len(objects)

                if num_matches == 1 and objects[0].key == path:
                    # we're getting a specific object
                    obj = self.s3.Object(bucket_name, path)
                    result = {
                        'path': '{}/{}'.format(bucket_name, path),
                        'type': 'file',
                        'mimetype': obj.content_type,
                        'content': base64.encodebytes(obj.get()['Body'].read()).decode('ascii')
                    }
                elif num_matches > 0:
                    # we're getting a "directory", i.e. a prefix

                    if path != "":
                        # need to add / to the prefix if not at the "root" of a bucket
                        path = path + "/"

                    all_objects = [
                        obj for obj in bucket.objects.filter(Prefix=path)
                    ]
                    result = set()
                    Content = namedtuple(
                        'Content', ['name', 'path', 'type', 'mimetype']
                    )
                    for obj in all_objects:
                        # regex to only get objects that are at the path's
                        # current depth e.g. for 'mypath/' we want
                        # 'mypath/obj1', 'mypath/obj2', but not 'mypath/myprefix/obj3'
                        matches = re.search(
                            r'('+re.escape(path)+r'[^\/]+\/?)', obj.key)
                        if matches:
                            # capture filename/object and directory/prefix names
                            match = matches.group(0)
                            if match.endswith('/'):
                                # dealing with a directory/prefix
                                directory_name = match.split('/')[-2]
                                result.add(
                                    Content(directory_name, match, 'directory', 'json'))
                            else:
                                # dealing with a file/object
                                file_name = match.split('/')[-1]
                                result.add(Content(file_name, obj.key, 'file',
                                                   obj.Object().content_type))
                    result = list(result)
                    result = [{
                        'name': content.name,
                        'path': '{}/{}'.format(bucket_name, content.path),
                        'type': content.type,
                        'mimetype': content.mimetype
                    } for content in result]

                else:
                    result = {
                        'error': 404, 'message': 'The requested resource could not be found.'
                    }
        except Exception as e:
            print(e)
            result = {'error': 500, 'message': str(e)}

        self.finish(json.dumps(result))


def _jupyter_server_extension_paths():
    return [{
        'module': 'jupyterlab_s3_browser'
    }]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.
    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    print("load_jupyter_server_extension: ...")
    web_app = nb_server_app.web_app
    base_url = web_app.settings['base_url']
    endpoint = url_path_join(base_url, 's3')
    handlers = [
        (url_path_join(endpoint, 'auth') + "(.*)", AuthHandler),
        (url_path_join(endpoint, 'files') + "(.*)", S3Handler)
    ]
    web_app.add_handlers('.*$', handlers)
