# PlusDate Backend Deployment Guide

## Deployment Goal

This document describes how to deploy the PlusDate backend in a reproducible way and what is required for a successful defense demonstration.

## Deployment Options

The backend can be deployed:

- locally with Docker Compose;
- on a private Linux server using Docker;
- in a cloud environment where the container is accessible through a public URL or IP.

## Local Docker Deployment

```bash
cd api-main
cp .env.example .env
docker compose up -d --build
```

After startup:

- API should be available on `http://localhost:8000`
- healthcheck should respond on `http://localhost:8000/api/healthcheck`

## Server Deployment

### Prerequisites

- Docker installed
- Docker Compose installed
- public domain or public IP
- configured environment variables in `.env`

### Steps

```bash
git clone <repository>
cd PlusDate/api-main
cp .env.example .env
docker compose up -d --build
```

### Required environment setup

At minimum configure:

- application URL;
- database connection;
- Redis connection;
- Telegram integration values;
- payment and webhook settings;
- storage settings;
- Centrifugo and RabbitMQ settings if used in the deployed setup.

## Production Availability

During defense the reviewer should be able to access:

- a public frontend URL;
- or a public backend URL / healthcheck endpoint;
- or both.

The frontend configuration in this repository references the production backend URL:

```text
https://api.plus.date
```

Before defense verify manually:

```bash
curl https://api.plus.date/api/healthcheck
```

## Container Architecture

Runtime components used by backend deployment:

- `api` — Laravel application container;
- `postgres` — PostgreSQL / PostGIS database;
- `redis` — cache / runtime support;
- `minio` — object storage for media in local-like deployments.

## Reproducibility Notes

- schema is created through migrations;
- configuration is driven by environment variables;
- runtime processes start through container entrypoint and supervisor;
- no manual DB schema editing is required.

## Defense Checklist

Before backend defense confirm the following:

1. Public deployment is reachable.
2. `.env` secrets are not committed.
3. The latest GitHub Actions workflow run is green.
4. `README`, API documentation, and deployment guide are committed in the repository.
