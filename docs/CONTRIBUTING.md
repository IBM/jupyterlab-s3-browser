# Contributing

Contributions to this extension are welcome.

## Setting up a Development Environment

### Prerequisites

- [Install pre-commit](https://pre-commit.com/#installation) and run `pre-commit install`
- [Install pipenv](https://github.com/pypa/pipenv#installation)

### Development

- Run `make dev` to create the development environment and begin watching the typescript files for changes. When changes are detected the extension will automatically be rebuilt.
- In a separate terminal pane, run `make run` to start jupyterlab.
- Changes to the lab extension will trigger automatic rebuilds of the extension as you make changes.
- Changes made to the server extension (i.e. the python code in `jupyterlab_s3_browser/`) will require you to ctrl+c and `make run` again.

## Release Publishing

To publish a new version of the lab extension and/or server extension:

- Update the version in [package.json](package.json)
- Update the version in [setup.py](setup.py)
  - note: you need to update _both_ versions, even if you modified just the lab extension or just the server extension one or the other
- Merge/push to the master branch.
- `git tag <TAG> && git push origin <TAG>` on the master branch to trigger a travis build/release.
