# Backend API — Distributed URL Shortener

This directory contains the Express.js backend API and the RabbitMQ background worker for the distributed URL shortener project.

## Architecture Highlights

1. **Module Pattern**: The codebase is organized by business domain (`modules/url`, `modules/auth`, `modules/analytics`) rather than technical role (controllers, models, services), improving maintainability.
2. **Caching**: Redis is used for extremely fast URL lookups. When a user creates or updates a short URL, the cache is invalidated.
3. **Async Event Processing**: Click tracking can be a bottleneck in high-traffic URL shorteners. To prevent the redirect endpoint from slowing down, click events are immediately published to a RabbitMQ queue and a background worker (`worker:click`) consumes them and batch-inserts into PostgreSQL.
4. **Security**:
    * Passwords are hashed with bcrypt.
    * JWTs are used for authentication. Refresh tokens are hashed in the database, enabling secure token rotation and reuse detection.
    * Rate limiting is implemented using Redis Lua scripts (Sliding Window Log algorithm).

## Setup Instructions

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Database Setup

Run the Prisma migrations to set up the PostgreSQL schema:

```bash
npx prisma migrate dev
```

### Running Locally

To run the backend, you need PostgreSQL, Redis, and RabbitMQ running. It is recommended to use the Docker Compose setup provided in the root directory.

If running manually:

```bash
# Start the API server
npm run dev

# Start the background click worker (in a separate terminal)
npm run worker:click
```

## Running Tests

Integration tests run against the Express app using Supertest and Vitest.

```bash
npm test
```
