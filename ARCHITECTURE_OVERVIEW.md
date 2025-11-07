# Architecture Overview

## Runtime Context
- Built with NestJS 11 as a modular HTTP API service (`src/main.ts`) that serves all endpoints under the `/api` prefix.
- Persisted storage is PostgreSQL accessed through Prisma ORM (`prisma/schema.prisma`), with migrations managed in `prisma/migrations/`.
- The service follows clean architecture conventions with explicit domain, application, infrastructure, and presentation layers (see also `README.md` for high-level guidance).

## Layered Structure
- **Domain layer** – Core business rules live in `src/domain/`:
  - `document.ts` defines the `Document` aggregate with invariant checks on id, title, content, and timestamps.
  - `entities/repositories/document-repository.ts` expresses the repository contract used throughout the application.
  - `errors/errors.ts` captures domain-specific failures (`NotFoundError`, `AccessCodeExpiredError`) surfaced to HTTP via filters.
- **Application layer** – Use cases in `src/application/` orchestrate domain logic:
  - `use-cases/create-document.ts` validates inputs, trims payloads, generates identifiers and timestamps, and persists through the repository interface.
- **Infrastructure layer** – Adapters that satisfy interfaces and supply external capabilities:
  - `infrastructure/persistence.module.ts` wires Prisma-backed persistence by binding `'DocumentRepository'` to `PostgreSQLDocumentRepository`.
  - `repositories/postgresql/document.ts` implements persistence using Prisma for CRUD access to the `documents` table.
  - `services/prisma.service.ts` extends `PrismaClient` with lifecycle hooks for module init/destroy.
  - `services.module.ts` binds `'Clock'` to `SystemClock` and `'IdGenerator'` to `UuidIdGenerator`, while `infrastructure/testing/` provides fakes for unit tests.
- **Presentation layer** – HTTP adapters in `src/adapters/http/` expose the API:
  - `document.controller.ts` hosts `POST /api/documents` and applies DTO validation (`dtos/create-document.ts`) plus `DomainExceptionFilter` for domain error translation.
  - `health.controller.ts` supplies `GET /api/health` and `GET /api/ready`, using `ConfigService` to decide whether a database check is required and `PrismaService` for liveness probes. Failures throw `DatabaseConnectionError`, caught by `filters/database-connection-exception.filter.ts`.
- **Configuration layer** – `src/config/` validates runtime environment:
  - `AppConfig` wraps environment variables and enforces production requirements such as a valid `DATABASE_URL`.
  - `ConfigService` bootstraps configuration, logs validation results, and exposes strongly typed access to database, environment, and server settings.

## Request and Data Flow
1. Incoming HTTP requests pass through NestJS global validation (`class-validator` decorators on DTOs) ensuring payload shape.
2. Controllers resolve use cases via dependency injection (`CreateDocumentUseCase` injected in `DocumentController`).
3. Use cases call the repository interface; DI supplies the PostgreSQL implementation in production or the in-memory implementation in tests.
4. The Prisma repository serialises domain objects to Postgres models and returns rich domain entities back up the stack.
5. Filters translate domain exceptions to HTTP responses, and successful results are mapped to response DTOs (`CreateDocumentResponse`).

## Current Features
- **Document ingestion API** – `POST /api/documents` accepts validated `title` and `content`, trims whitespace, generates IDs/timestamps via injected services, and persists documents to PostgreSQL while returning the generated identifier (`src/adapters/http/document.controller.ts` & `src/application/use-cases/create-document.ts`).
- **Health endpoints** – `GET /api/health` returns service status with timestamps, while `GET /api/ready` verifies database connectivity when configured, surfacing connection failures with 503 responses (`src/adapters/http/health.controller.ts`).
- **Configuration safety nets** – Production deployments fail fast if `DATABASE_URL` is missing or malformed; development/test modes allow running without a database but log a warning for clarity (`src/config/app-config.ts`, `src/config/config.service.ts`).
- **Persistence layer** – Prisma schema (`prisma/schema.prisma`) and generated migration (`prisma/migrations/20251104161932_init/migration.sql`) define a `documents` table storing IDs, titles, contents, and timestamps, with repository methods for save, lookup, and bulk retrieval.
- **Testing support** – In-memory repositories plus fake clock/ID services (`src/infrastructure/testing/`) drive fast unit tests, while NestJS testing modules and Supertest cover HTTP validation paths (`src/adapters/http/document.controller.spec.ts`, `src/application/use-cases/create-document.spec.ts`).

## Operational Tooling
- Containerisation is provided via `dockerfile`; Kubernetes manifests for deployment, service, and ad-hoc migration jobs live under `k8s/`.
- NPM scripts in `package.json` orchestrate builds, linting, tests, and Prisma workflows (e.g., `db:migrate`, `db:port-forward` for local cluster access).
- `.github/workflows/cicd.yml` (see repository) runs quality gates, database migrations, and end-to-end tests in CI to protect mainline stability.
