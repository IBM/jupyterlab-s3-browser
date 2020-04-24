SHELL=/bin/bash
.ONESHELL:
CONDA_ACTIVATE=source $$(conda info --base)/etc/profile.d/conda.sh ; conda activate ; conda activate
CONDA_ENV_NAME=jupyterlab-s3-browser
PYTHON_PACKAGE_NAME=jupyterlab_s3_browser

default: setup

setup: setup_pipenv build_lab_extension install_lab_extension

setup_pipenv:
	@pipenv install

build_lab_extension:
	@yarn install
	@yarn run build

install_lab_extension: build_lab_extension
	@pipenv run jupyter labextension link .

enable_server_extension:
	@pipenv run jupyter serverextension enable --py $(PYTHON_PACKAGE_NAME)

dev: setup install_lab_extension
	@yarn run watch

run:
	@pipenv run jupyter lab --watch

test:
	@pipenv run coverage run -m pytest $(PYTHON_PACKAGE_NAME) && coverage report --fail-under 50

clean:
	@rm -rf node_modules/
