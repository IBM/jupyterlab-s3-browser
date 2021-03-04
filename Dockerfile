FROM python
RUN pip install jupyterlab~=3.0
COPY dist/jupyterlab_s3_browser-0.8.0.dev9-py3-none-any.whl .
RUN pip install jupyterlab_s3_browser-0.8.0.dev9-py3-none-any.whl
