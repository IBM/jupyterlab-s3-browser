# jupyterlab-s3-browser [![Build Status](https://travis-ci.org/IBM/jupyterlab-s3-browser.svg?branch=master)](https://travis-ci.org/IBM/jupyterlab-s3-browser)

[![npm version](https://badge.fury.io/js/jupyterlab-s3-browser.svg)](https://badge.fury.io/js/jupyterlab-s3-browser) [![PyPI version](https://badge.fury.io/py/jupyterlab-s3-browser.svg)](https://badge.fury.io/py/jupyterlab-s3-browser)

A JupyterLab extension for browsing S3-compatible object storage.

## Installation

To install, run:

```
jupyter labextension install jupyterlab-s3-browser
pip install jupyterlab-s3-browser
```

You may also need to run:

```
jupyter serverextension enable --py jupyterlab_s3_browser
```

to make sure the serverextension is enabled and then restart (stop and start) JupyterLab.

#### Amazon SageMaker

[View installation instructions specific to SageMaker here.](docs/SAGEMAKER.md) Thanks to [Bipin Pandey](https://github.com/Bipin007) for helping figure this out.

## Contributing

Contributions to this extension are welcome! [View CONTRIBUTING.md to get started.](docs/CONTRIBUTING.md)
