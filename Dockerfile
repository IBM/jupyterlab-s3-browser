FROM python
RUN pip install jupyterlab~=3.0
# COPY /Users/jamesreeve/src/github.com/IBM/jupyterlab-s3-browser/dist/jupyterlab_s3_browser-0.8.0.dev8-py3-none-any.whl .
COPY dist/jupyterlab_s3_browser-0.8.0.dev8-py3-none-any.whl .
RUN pip install jupyterlab_s3_browser-0.8.0.dev8-py3-none-any.whl
# RUN pip install jupyterlab-s3-browser==0.8.0.dev8 &&jupyter labextension install jupyterlab-s3-browser==0.8.0
