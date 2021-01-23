FROM python:3.7-slim
RUN apt-get update && apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_14.x  | bash - \
  && apt-get install nodejs -y \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN pip install -e .[dev]
RUN jupyter labextension link . && jupyter serverextension enable --py jupyterlab_s3_browser
EXPOSE 8888
CMD ["jupyter", "lab"]
