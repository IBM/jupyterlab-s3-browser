SHELL=/bin/bash
.ONESHELL:
CONDA_ACTIVATE=source $$(conda info --base)/etc/profile.d/conda.sh ; conda activate ; conda activate
CONDA_ENV_NAME=jupyterlab-s3-browser
PYTHON_PACKAGE_NAME=jupyterlab_s3_browser

default: setup

setup: setup_conda_env build_lab_extension install_lab_extension

setup_conda_env: clean
	@conda env create -f environment.yml
	@$(CONDA_ACTIVATE) $(CONDA_ENV_NAME)

build_lab_extension:
	@yarn install
	@yarn run build

install_lab_extension: build_lab_extension
	@$(CONDA_ACTIVATE) $(CONDA_ENV_NAME) && jupyter labextension link .

install_server_extension:
	@$(CONDA_ACTIVATE) $(CONDA_ENV_NAME) && pip install . && jupyter labextension link . && jupyter serverextension enable --py $(PYTHON_PACKAGE_NAME)

dev: install_lab_extension install_server_extension
	@$(CONDA_ACTIVATE) $(CONDA_ENV_NAME) && yarn run watch

run:
	@$(CONDA_ACTIVATE) $(CONDA_ENV_NAME) && jupyter lab --watch

test:
	@$(CONDA_ACTIVATE) $(CONDA_ENV_NAME) && coverage run -m pytest $(PYTHON_PACKAGE_NAME) && coverage report --fail-under 50

clean:
	@echo "cleaning up any existing environment"
	@conda env remove -n $(CONDA_ENV_NAME) || echo "no existing conda environment"
	@rm -rf node_modules/
	@echo "finished cleaning"
