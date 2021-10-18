FROM python

# RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
# RUN apt-get -y install nodejs

RUN pip install "jupyterlab==2.*"
# RUN pip install "jupyterlab==3.*"


COPY dist/*.whl .
RUN pip install *.whl

RUN jupyter serverextension enable --py jupyterlab_s3_browser
