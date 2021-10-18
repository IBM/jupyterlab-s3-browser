FROM python

RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs

RUN pip install "jupyterlab==2.*"
# RUN pip install "jupyterlab==3.*"

# COPY yarn.lock .
# RUN jlpm

# COPY . .
# RUN pip install .
# RUN jupyter labextension link .
RUN jupyter labextension install jupyterlab-s3-browser@0.11.0-dev.4 && pip install jupyterlab_s3_browser==0.11.0-dev.4

RUN jupyter serverextension enable --py jupyterlab_s3_browser
