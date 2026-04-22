# PlusDate

PlusDate is a diploma project for a dating platform built as a **Telegram Mini App**.

The repository is split into two main parts:

- `spa-main` — frontend SPA for the Telegram Mini App
- `api-main` — backend API, business logic, database layer, and integrations

## Project Overview

PlusDate supports the main dating flow:

- Telegram-based authentication
- onboarding and profile creation
- swipe feed, likes, and matches
- chats and real-time events
- moderation workflows
- subscriptions and payments
- reports, blocking, and account deletion

## Repository Structure

```text
PlusDate/
├── api-main/                 Backend (Laravel 12, PostgreSQL, Redis, RabbitMQ)
├── spa-main/                 Frontend SPA (React / Vite Telegram Mini App)
└── .github/workflows/        CI configuration
```

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- SPA architecture with routing and modular feature structure

### Backend

- PHP 8.2+
- Laravel 12
- PostgreSQL / PostGIS
- Redis
- RabbitMQ
- Laravel Sanctum
- Docker / Docker Compose

## Quick Start

### Backend

```bash
cd api-main
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend docs:

- [api-main/README.md](/Users/danila/Projets/PlusDate/api-main/README.md)
- [api-main/API_DOCUMENTATION.md](/Users/danila/Projets/PlusDate/api-main/API_DOCUMENTATION.md)
- [api-main/DEPLOYMENT.md](/Users/danila/Projets/PlusDate/api-main/DEPLOYMENT.md)

### Frontend

```bash
cd spa-main
npm install
npm run dev
```

Frontend deployment notes:

- [spa-main/DOCKER_SETUP.md](/Users/danila/Projets/PlusDate/spa-main/DOCKER_SETUP.md)

## Docker

Both project parts contain their own containerization setup:

- `api-main/Dockerfile`
- `api-main/docker-compose.yml`
- `spa-main/Dockerfile`
- `spa-main/docker-compose.yml`

## CI

Backend CI is configured with GitHub Actions:

- [backend-ci.yml](/Users/danila/Projets/PlusDate/.github/workflows/backend-ci.yml)

The pipeline:

- validates Composer configuration
- installs dependencies
- prepares a test environment
- runs tests with coverage
- uploads the coverage artifact

## Documentation for Defense

Prepared project documentation:

- [BACKEND_DEFENSE_DOCUMENTATION.md](/Users/danila/Projets/PlusDate/BACKEND_DEFENSE_DOCUMENTATION.md)
- [PLUSDATE_BA_DIPLOMA.md](/Users/danila/Projets/PlusDate/PLUSDATE_BA_DIPLOMA.md)
- [PLUSDATE_BA_DIPLOMA_EN.md](/Users/danila/Projets/PlusDate/PLUSDATE_BA_DIPLOMA_EN.md)

Generated deliverables:

- BA `.docx` and `.pdf`
- backend defense `.docx`

## Production / Public Access

The repository contains deployment instructions for running the project in a containerized environment and exposing the application through a public URL.

Referenced production backend URL:

```text
https://api.plus.date
```

## Notes

- Secrets are expected to be stored in environment variables, not in the repository.
- Database schema is managed through migrations.
- Test coverage is generated in CI as an artifact.
- Code style check is configured in CI as non-blocking at the moment.
