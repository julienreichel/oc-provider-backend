# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-11-07

### Added
- Document lifecycle support with status/access-code fields plus Prisma migrations.
- REST endpoints for listing, fetching, updating, and sending documents.
- Prisma-backed pagination and repository contract for cursor-based queries.
- Config validation for `CLIENT_BASE_URL` and gateway wiring via Nest `HttpModule`.
- In-memory and Prisma-based E2E harnesses, controller specs, and client integration tests.
- Kubernetes manifests, GitHub Actions workflows, and documentation covering local/CI flows.

### Changed
- Switched infrastructure stack to the oc-infra templated layout (Traefik ingress, reusable CI workflows).
- Adopted Clean Architecture layering with Boston-style testing patterns.
- Updated Dockerfile and build scripts to align with NestJS output structure.

### Fixed
- Pagination sequencing issues in Prisma repository.
- TLS handling for local client backend calls (development mode guard).
- Miscellaneous k8s manifest names, image paths, and permissions.

