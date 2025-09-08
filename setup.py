"""
jupyterlab_s3_browser setup
This file is kept for backwards compatibility with older installation methods.
The actual metadata is now in pyproject.toml
"""

import setuptools

setuptools.setup(
    name="jupyterlab_s3_browser",
    description="JupyterLab extension for browsing S3-compatible object storage",
    long_description="JupyterLab extension for browsing S3-compatible object storage",
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    install_requires=[
        "jupyter_server>=2.0.0",
        "boto3",
        "s3fs>=2021.10.1",
        "singleton-decorator",
        "jupyterlab>=4.0.0",
    ],
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.8",
    license="Apache-2.0",
)
