# Contributing

Contributions to this extension are welcome.

## Setting up a Development Environment

### Prerequisites

- [Install poetry](https://python-poetry.org/docs/#installation)
- [Install pre-commit](https://pre-commit.com/#installation)

### Development

```bash
git clone https://github.com/IBM/jupyterlab-s3-browser.git
cd jupyterlab-s3-browser
pre-commit install
poetry shell
jupyter labextension develop . --overwrite
```

To start JupyterLab and automatically reload when changes are made to the serverextension (python code) run

```bash
jupyter lab --autoreload --no-browser
```

`--no-browser` prevents a new tab from opening every time you make a change

To automatically watch and rebuild when changes are made to the labextension (typescript code), run (in a separate terminal):

```bash
jlpm run watch
```

## Release Publishing

To publish a new version of the lab extension and server extension:

- Update the version in [package.json](package.json)
- Merge/push your changes to the master branch.
- Create a new GitHub release to publish to pypi / npm.
