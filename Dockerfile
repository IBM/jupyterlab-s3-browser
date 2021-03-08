FROM python


RUN pip install jupyterlab~=3.0
# RUN pip install jupyterlab==2.2.9


# COPY dist/jupyterlab_s3_browser-0.9.0.dev1-py3-none-any.whl .
# RUN pip install jupyterlab_s3_browser-0.9.0.dev1-py3-none-any.whl
RUN pip install jupyterlab-s3-browser==0.9.0.dev1


# RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
# RUN apt-get -y install nodejs
# RUN jupyter labextension install jupyterlab-s3-browser@0.9.0-dev.0
RUN jupyter serverextension enable --py jupyterlab_s3_browser
