"""
Setup module for the jupyterlab_s3_browser proxy extension
"""
import setuptools

from setupbase import create_cmdclass
from setupbase import ensure_python
from setupbase import find_packages

data_files_spec = [
    (
        "etc/jupyter/jupyter_notebook_config.d",
        "jupyter-config/jupyter_notebook_config.d",
        "jupyterlab_s3_browser.json",
    ),
]

cmdclass = create_cmdclass(data_files_spec=data_files_spec)

setup_dict = dict(
    name="jupyterlab_s3_browser",
    description="A Jupyter server extension for the JupyterLab S3 Browser extension",
    packages=find_packages(),
    cmdclass=cmdclass,
    author="James Reeve",
    author_email="james.reeve@ibm.com",
    url="https://github.com/IBM/jupyterlab-s3-browser",
    license="Apache 2",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "S3"],
    python_requires=">=3.5",
    classifiers=[
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
    ],
    install_requires=["notebook", "boto3", "singleton-decorator", "jupyterlab>=3.0.0"],
    extras_require={"dev": ["pytest", "moto", "coverage"]},
)

try:
    ensure_python(setup_dict["python_requires"].split(","))
except ValueError as e:
    raise ValueError(
        "{:s}, to use {} you must use python {} ".format(
            e, setup_dict["name"], setup_dict["python_requires"]
        )
    )

setuptools.setup(version="0.8.0-dev.1", **setup_dict)
