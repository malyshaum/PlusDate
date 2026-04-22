# PlusDate Backend

Backend for the **PlusDate** diploma project.  
The application serves a Telegram Mini App dating platform and provides:

- Telegram-based authentication;
- profile management;
- feed, swipes, likes, and matches;
- chat and real-time notifications;
- moderation workflows;
- subscription and payment flows;
- blocking, reports, and account deletion.

## Stack

- PHP 8.2+
- Laravel 12
- PostgreSQL / PostGIS
- Redis
- RabbitMQ
- Laravel Sanctum
- Docker / Docker Compose

## Repository Structure

- `app/Http/Controllers` — API endpoints and request entrypoints
- `app/Http/Requests` — validation layer
- `app/Services` — business logic
- `app/Repositories` — data-access abstractions
- `app/Models` — Eloquent ORM models
- `app/Jobs`, `app/Events`, `app/Listeners` — asynchronous and event-driven flows
- `database/migrations` — database schema versioning
- `database/seeders` — test and reference data
- `tests` — automated tests

## Quick Start

### Local start without Docker

```bash
cd api-main
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Local start with Docker

```bash
cd api-main
docker compose up -d --build
```

By default the backend exposes:

- `http://localhost:8000` — API / Octane
- `http://localhost:8080` — Reverb / realtime server
- `http://localhost:5432` — PostgreSQL
- `http://localhost:6379` — Redis

Healthcheck endpoint:

```text
GET /api/healthcheck
```

## Testing

Run automated tests:

```bash
cd api-main
php artisan test
```

Run tests with coverage:

```bash
cd api-main
php artisan test --coverage-text --coverage-clover=coverage.xml
```

GitHub Actions CI is configured in:

- [backend-ci.yml](../.github/workflows/backend-ci.yml)

## Documentation

Additional backend documentation:

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [BACKEND_DEFENSE_DOCUMENTATION.md](../BACKEND_DEFENSE_DOCUMENTATION.md)

## Production Notes

The backend is intended to be deployed in a containerized environment.  
Frontend deployment configuration in this project references the production API URL:

- `https://api.plus.date`

Before defense, verify that:

- the public URL is reachable;
- environment variables are configured outside the repository;
- the latest GitHub Actions workflow passes successfully.
