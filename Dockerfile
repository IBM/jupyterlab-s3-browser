FROM python

# RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
# RUN apt-get -y install nodejs

RUN pip install jupyterlab~=3.0
# RUN pip install jupyterlab==2.2.9


COPY dist/*.whl .
RUN pip install *.whl
# RUN pip install jupyterlab-s3-browser==0.9.0.dev1
RUN jupyter labextension list && jupyter serverextension list


# RUN jupyter labextension install jupyterlab-s3-browser@0.9.0-dev.0
RUN jupyter serverextension enable --py jupyterlab_s3_browser
