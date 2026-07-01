# Advanced Web Development

A collection of full-stack web development coursework, built up progressively over one semester. The centrepiece is a **booking system** developed across seven phases — starting from a static frontend and ending with a fully containerized Node/Express + PostgreSQL application with JWT authentication.

## What's inside

| Folder | Description |
|--------|-------------|
| `BookingSystemPhase1–7` | A booking/reservation system built incrementally. Each phase adds capability — from static HTML/JS through to a REST API, PostgreSQL persistence, input validation, structured logging, and JWT-based authentication. |
| `final-project` | A responsive e-commerce front end (e-bike shop) built with React + Vite. |
| `final-exam` | End-of-course exam solution. |

## Booking system — phase progression

- **Phase 1–3** — Frontend foundations and a Node/Express server serving static assets and basic routes.
- **Phase 4–5** — PostgreSQL integration via a connection pool; CRUD endpoints for resources and reservations.
- **Phase 6** — Refactored into a clean architecture: separated `routes`, `services`, `validators`, and a database layer, with request validation and logging.
- **Phase 7** — Added **user accounts and JWT authentication** (register/login, `requireAuth` middleware protecting routes), SQL migrations for users/resources/logs/reservations, and full **Docker + docker-compose** setup.

## Tech stack

**Backend:** Node.js, Express, PostgreSQL, JWT, express-validator
**Frontend:** HTML, CSS, JavaScript, React (final project)
**Tooling:** Docker, docker-compose, ESLint

## Running a phase locally

Each backend phase is self-contained. From inside a phase folder (e.g. `BookingSystemPhase7`):

```bash
# 1. Copy the example environment file and fill in your own values
cp .env.example .env

# 2. Start the app (with PostgreSQL) via Docker
docker-compose up --build
```

Then open the app in your browser at the port defined in your `.env`.

> **Note:** Real credentials are never committed. Copy `.env.example` to `.env` and provide your own database password and JWT secret locally.

## What this demonstrates

Building a backend from first principles up to a production-shaped, authenticated, containerized service — REST API design, relational data modelling, input validation, authentication, and Docker-based deployment.