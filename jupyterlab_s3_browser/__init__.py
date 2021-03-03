import json
from pathlib import Path
from .handlers import setup_handlers

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "jupyterlab_s3_browser"}]


def _jupyter_server_extension_points():
    return [{"module": "jupyterlab_s3_browser"}]


# old??
#  def _jupyter_server_extension_paths():
#  return [{"module": "jupyterlab_s3_browser"}]


# old??
#  def load_jupyter_server_extension(server_app):
#  """Registers the API handler to receive HTTP requests from the frontend extension.

#  Parameters
#  ----------
#  server_app: jupyterlab.labapp.LabApp
#  JupyterLab application instance
#  """
#  setup_handlers(server_app.web_app)
#  server_app.log.info(
#  "Registered JupyterLab S3 Browser extension at URL path /jupyterlab_s3_browser"
#  )


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    setup_handlers(server_app.web_app)
    server_app.log.info(
        "Registered JupyterLab S3 Browser extension at URL path /jupyterlab_s3_browser"
    )


load_jupyter_server_extension = _load_jupyter_server_extension
