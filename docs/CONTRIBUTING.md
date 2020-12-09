# Contributing

Contributions to this extension are welcome.

## Setting up a Development Environment

### Prerequisites

- [Install docker](https://docs.docker.com/get-docker/)
- [Install docker-compose](https://docs.docker.com/compose/install/)
- [Install pre-commit](https://pre-commit.com/#installation) and run `pre-commit install`

### Development

- Run `make build` to build development docker images.
- Run `make run` to start the docker images. JupyterLab will eventually start on [localhost:8888](http://localhost:8888) and a minio instance will start on [localhost:9000](http://localhost:9000). Changes made to either the labextension (typescript files) or serverextension (python files) will be picked up automatically, but will require a browser refresh. The reload is not instantaneous, so watch the logs to see when the reload is complete.
- Run `make test` to run tests (work-in-progress, very little coverage right now)

## Release Publishing

To publish a new version of the lab extension and/or server extension:

- Update the version in [package.json](package.json)
- Update the version in [setup.py](setup.py)
  - note: you need to update _both_ versions, even if you modified just the lab extension or just the server extension one or the other
- Merge/push to the master branch.
- `git tag <TAG> && git push origin <TAG>` on the master branch to trigger a travis build/release.
