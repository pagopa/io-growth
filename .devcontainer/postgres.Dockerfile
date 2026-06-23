FROM postgres:16.13@sha256:760ea41aae126965bedd587d35a23de37447bb13a6ac4444bef6ff73b8b72234

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-16-cron \
  && rm -rf /var/lib/apt/lists/*
