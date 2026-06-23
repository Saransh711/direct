# Architecture Overview

## Style

- Feature-first modular architecture with domain-driven boundaries.
- Layered internals inside each module: route -> controller -> service -> repository/data access.
- Cross-cutting concerns centralized in middleware and common utilities.

## Major Decisions

1. Prisma with PostgreSQL for transactional consistency and schema governance.
2. Redis for rate limiting and future queue/caching support.
3. JWT access tokens and rotating refresh tokens with server-side token registry.
4. Zod-based request validation and centralized error contracts.
5. Correlation IDs + Pino structured logging for traceability and auditability.
6. Rule-based eligibility engine designed for future strategy replacement.
7. Deterministic simulated credit bureau with retries and circuit breaker behavior.

## Request Lifecycle

1. Correlation ID assignment
2. Security middleware (helmet, CORS, body limits)
3. Rate limit check (Redis-backed)
4. Auth + RBAC checks (if protected)
5. Request validation (Zod)
6. Controller orchestration
7. Domain service execution + Prisma transaction boundaries
8. Audit and notification side effects
9. Standardized response contract

## Module Responsibilities

- auth: registration, login, token lifecycle
- users: profile and customer history
- loan-products: active product catalog
- loan-applications: submission, list, status
- eligibility: eligibility scoring and policy decisions
- credit-bureau: simulated bureau retrieval and request tracking
- admin: review/approve/reject workflows
- disbursement: post-approval funds release
- notifications: in-app alerts and read tracking
- audit: event tracking and forensic query endpoint
- dashboard: reporting metrics for ops/admin
