import json
from pathlib import Path
from .handlers import setup_handlers
from traitlets import Unicode
from traitlets.config import Configurable
from os import environ

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "jupyterlab_s3_browser"}]


def _jupyter_server_extension_points():
    return [{"module": "jupyterlab_s3_browser"}]


class JupyterLabS3(Configurable):
    """
  Config options for jupyterlab_s3_browser
  """

    endpoint_url = Unicode(
        default_value=environ.get("JUPYTERLAB_S3_ENDPOINT", ""),
        config=True,
        help="The url for the S3 api",
    )
    client_id = Unicode(
        default_value=environ.get("JUPYTERLAB_S3_ACCESS_KEY_ID", ""),
        config=True,
        help="The client ID for the S3 api",
    )
    client_secret = Unicode(
        default_value=environ.get("JUPYTERLAB_S3_SECRET_ACCESS_KEY", ""),
        config=True,
        help="The client secret for the S3 api",
    )

    session_token = Unicode(
        default_value=environ.get("JUPYTERLAB_S3_SESSION_TOKEN", ""),
        config=True,
        help="(Optional) Token if you use STS as auth method",
    )


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    s3_config = JupyterLabS3(config=server_app.config)
    server_app.web_app.settings["s3_config"] = s3_config
    setup_handlers(server_app.web_app)


# backwards compatibility with jupyterlab 2.0
load_jupyter_server_extension = _load_jupyter_server_extension
_jupyter_server_extension_paths = _jupyter_server_extension_points
