"""
jupyterlab_s3_browser setup
"""
import json
from pathlib import Path

from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
    skip_if_exists,
)
import setuptools

HERE = Path(__file__).parent.resolve()

# The name of the project
name = "jupyterlab_s3_browser"

# Get our version
pkg_json = json.loads((HERE / "package.json").read_bytes())
version = pkg_json["version"]

lab_path = HERE / name / "labextension"

# Representative files that should exist after a successful build
jstargets = [
    str(lab_path / "package.json"),
]

package_data_spec = {
    name: ["*"],
}

labext_name = "jupyterlab-s3-browser"

data_files_spec = [
    ("share/jupyter/labextensions/%s" % labext_name, str(lab_path), "**"),
    ("share/jupyter/labextensions/%s" % labext_name, str(HERE), "install.json"),
    (
        "etc/jupyter/jupyter_server_config.d",
        "jupyter-config/jupyter_server_config.d",
        "jupyterlab_s3_browser.json",
    ),
    (
        "etc/jupyter/jupyter_notebook_config.d",
        "jupyter-config/jupyter_notebook_config.d",
        "jupyterlab_s3_browser.json",
    ),
]


cmdclass = create_cmdclass(
    "jsdeps", package_data_spec=package_data_spec, data_files_spec=data_files_spec
)

js_command = combine_commands(
    install_npm(HERE, build_cmd="build:prod", npm=["jlpm"]), ensure_targets(jstargets),
)

is_repo = (HERE / ".git").exists()
if is_repo:
    cmdclass["jsdeps"] = js_command
else:
    cmdclass["jsdeps"] = skip_if_exists(jstargets, js_command)

#  long_description = (HERE / "README.md").read_text()

setup_args = dict(
    name=name,
    version=pkg_json["version"],
    url=pkg_json["homepage"],
    author=pkg_json["author"],
    description=pkg_json["description"],
    license=pkg_json["license"],
    packages=setuptools.find_packages(),
    cmdclass=cmdclass,
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "JupyterLab3", "S3"],
    python_requires=">=3.6",
    zip_safe=False,
    include_package_data=True,
    classifiers=[
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Framework :: Jupyter",
    ],
    install_requires=[
        "notebook",
        "boto3",
        "jupyter_server",
        "singleton-decorator",
        "jupyterlab>=2.0.0",
    ],
    extras_require={"dev": ["jupyter_packaging~=0.7.9", "pytest", "moto", "coverage"]},
)

if __name__ == "__main__":
    setuptools.setup(**setup_args)
