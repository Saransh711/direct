# Docker Setup

## Single Container Build

- Build image:
  - `docker build -t loan-backend .`
- Run image:
  - `docker run --env-file .env -p 4000:4000 loan-backend`

## Compose Stack

- Start all services:
  - `docker compose up -d`
- Stop all services:
  - `docker compose down`

Compose provisions:

- API service
- PostgreSQL 16
- Redis 7
