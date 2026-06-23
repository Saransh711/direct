# Loan Application & Eligibility Management System (Backend)

Production-structured backend for a regulated lending workflow using Node.js, Express, TypeScript, PostgreSQL, Prisma, and Redis.

## Quick Start

1. Copy `.env.example` to `.env` and adjust values.
2. Start infra:
   - `docker compose up -d postgres redis`
3. Run migrations:
   - `npm run prisma:migrate`
4. Seed base data:
   - `npm run prisma:seed`
5. Run service:
   - `npm run dev`

## API URLs

- Base API: `http://localhost:4000/api`
- Swagger UI: `http://localhost:4000/api/docs`
- Health: `http://localhost:4000/health`
- Readiness: `http://localhost:4000/ready`
- Metrics: `http://localhost:4000/metrics`

## Documentation Map

- Architecture: `docs/architecture-overview.md`
- Folder Structure: `docs/folder-structure.md`
- Database Design: `docs/database-design.md`
- ER Diagram: `docs/er-diagram.md`
- Prisma Setup: `docs/prisma-setup.md`
- Migration Strategy: `docs/migration-strategy.md`
- Auth Flow: `docs/auth-flow.md`
- Refresh Rotation: `docs/refresh-token-rotation.md`
- Security Checklist: `docs/security-checklist.md`
- Environment Guide: `docs/environment-variables-guide.md`
- Swagger Setup: `docs/swagger-setup.md`
- Docker Setup: `docs/docker-setup.md`
- Deployment Guide: `docs/deployment-guide.md`
- Production Checklist: `docs/production-readiness-checklist.md`
- Manual API Verification: `docs/manual-api-verification.md`
- Postman Guide: `docs/postman-usage-guide.md`
- ADRs: `docs/adr/`
- JSON API Contract: `contracts/api-contract.json`
- Postman Collection: `postman/loan-system.postman_collection.json`
- Postman Environment: `postman/loan-system.local.postman_environment.json`
