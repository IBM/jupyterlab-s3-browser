FROM python

RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs
RUN npm install --global yarn

RUN python -m pip install --upgrade pip
RUN pip install "poetry==1.1.12"

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN poetry export --dev --without-hashes -f requirements.txt > requirements.txt
RUN pip install -r requirements.txt

COPY package.json .
RUN yarn

COPY . .
RUN pip install .

RUN jupyter serverextension enable --py jupyterlab_s3_browser
