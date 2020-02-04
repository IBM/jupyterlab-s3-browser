# Running on AWS SageMaker

If you're using AWS SageMaker,

1. Stop and start your sagemaker instance (to make sure you're starting fresh)
2. Open a terminal, and run `source activate JupyterSystemEnv` to switch to JupyterLab's conda environment
3. Run `jupyter labextension install jupyterlab-s3-browser` to install the lab extension
4. Run `pip install jupyterlab-s3-browser` to install the server extension
5. Run `jupyter serverextension enable --py jupyterlab_s3_browser` to make sure the server extension is enabled
6. Run `sudo initctl restart jupyter-server --no-wait` to restart your jupyterlab server
7. Refresh the page
8. You should now have the bucket icon on your sidebar. Use https://s3.amazonaws.com as your endpoint. Enter your access key and secret key generated on this page: https://console.aws.amazon.com/iam/home#security_credential

You'll need to perform these instructions every time you log in, because SageMaker doesn't save the state of your installed extensions.
