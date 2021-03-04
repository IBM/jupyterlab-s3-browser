.PHONY: build
build:
	@docker-compose build

.PHONY: build-labextension
build-labextension:
	@docker-compose run jupyterlab /bin/bash -c 'jupyter labextension build'

.PHONY: run
run:
	@docker-compose up

.PHONY: test
test:
	@echo "labextension tests not yet implemented" && echo "running serverextension tests" && docker-compose run jupyterlab /bin/bash -c 'coverage run -m pytest jupyterlab_s3_browser && coverage report --fail-under 50'

.PHONY: clean
clean:
	@docker-compose down
