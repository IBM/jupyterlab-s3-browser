# Contributing

Contributions to this extension are welcome.

## Setting up a Development Environment

### Initial Setup

- [Install pre-commit](https://pre-commit.com/#installation) and run `pre-commit install`

### Development

- Run `make setup` to prepare your development environment.
- To watch and automatically rebuild the lab extension run `make dev`
- In a separate terminal pane, run `make lab` to start jupyterlab.
- Changes to the lab extension will trigger automatic rebuilds of the extension as you make changes.
- Changes made to the server extension (i.e. the python code in `jupyterlab_s3_browser/`) will require you to run `make dev` and `make lab` again.

## Release Publishing

To publish a new version of the lab extension and/or server extension:

- Update the version in [package.json](package.json)
- Update the version in [setup.py](setup.py)
  - note: you need to update _both_ versions, even if you modified just the lab extension or just the server extension one or the other
- Merge/push to the master branch.
- `git tag <TAG> && git push origin <TAG>` on the master branch to trigger a travis build/release.
