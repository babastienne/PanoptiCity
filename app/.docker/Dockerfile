FROM ubuntu:noble

ENV PYTHONUNBUFFERED 1
RUN mkdir /app
WORKDIR /app

RUN apt-get update -qq && apt-get install -y -qq \
    # std libs
    git less nano curl \
    ca-certificates \
    wget build-essential\
    # python basic libs
    python3.12 python3.12-dev python3.12-venv python3-pip gettext \
    # geodjango
    gdal-bin binutils libproj-dev libgdal-dev \
    # postgresql
    libpq-dev postgresql-client && \
    apt-get clean all && rm -rf /var/apt/lists/* && rm -rf /var/cache/apt/*

RUN --mount=type=cache,target=/home/ubuntu/.cache/pip,sharing=locked python3.12 -m venv /app/venv &&  \
    /app/venv/bin/pip install --upgrade pip wheel setuptools

COPY justsmile/requirements.txt /app/requirements.txt
RUN --mount=type=cache,target=/home/ubuntu/.cache/pip,sharing=locked  \
    /app/venv/bin/pip install -r /app/requirements.txt

COPY . /app

CMD ["/bin/bash"]
