# Running on AWS SageMaker

If you're using AWS SageMaker, make sure what version of JupyterLab it is
running. If you are not sure, you can open a terminal and running the following
command:

```
jupyter --version
```

Look for the line with the name "jupyterlab".

**If the version is JupyterLab 1.x or 2.x:**

1. Stop and start your sagemaker instance (to make sure you're starting fresh)
2. Open a terminal, and run `source activate JupyterSystemEnv` to switch to JupyterLab's conda environment
3. Run `jupyter labextension install jupyterlab-s3-browser` to install the lab extension
4. Run `pip install jupyterlab-s3-browser` to install the server extension
5. Run `jupyter serverextension enable --py jupyterlab_s3_browser` to make sure the server extension is enabled
6. Run `sudo initctl restart jupyter-server --no-wait` to restart your jupyterlab server
7. Refresh the page

**If the version is JupyterLab 3.x:**

1. Stop and start your sagemaker instance (to make sure you're starting fresh)
2. Open a terminal, and run `conda activate studio` to switch to JupyterLab's conda environment
3. Run `pip install jupyterlab-s3-browser` to install the server extension
4. Run `jupyter serverextension enable --py jupyterlab_s3_browser` to make sure the server extension is enabled
5. Run `restart-jupyter-server` to restart your jupyterlab server
6. Refresh the page

You should now have the bucket icon on your sidebar. Use
https://s3.amazonaws.com as your endpoint. Enter your access key and secret key
generated on this page:
https://console.aws.amazon.com/iam/home#security_credential.

You'll need to perform these instructions every time you log in, because SageMaker doesn't save the
state of your installed extensions. However, you can create a lifecycle configuration that executes those
commands (except restarting the server) every time an instance is created
