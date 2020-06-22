FROM python:3.7.7-alpine3.12
RUN apk add --update gcc musl-dev libffi-dev openssl-dev python3-dev cython zeromq-dev nodejs nodejs-npm
RUN pip install pipenv
COPY . .
# RUN pipenv install
# RUN pipenv run jupyter labextension link . --debug
# RUN pipenv run jupyter serverextension enable --py jupyterlab_s3_browser
EXPOSE 8888
CMD ["pipenv", "run", "jupyter", "lab", "--ip=0.0.0.0", "--LabApp.token=''", "--allow-root", "--no-browser"]
