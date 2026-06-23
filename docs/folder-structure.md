# Folder Structure Explanation

## Root

- `src/`: application source code
- `prisma/`: schema and seeding
- `docs/`: architecture, security, and operations documentation
- `contracts/`: frontend-facing API source-of-truth JSON contracts
- `postman/`: API collection and environment files

## Source Breakdown

- `src/config/`: environment loading, logger, redis, swagger initialization
- `src/common/`: shared response contract and error primitives
- `src/middleware/`: correlation, auth, RBAC, rate limit, validation, error and metrics middleware
- `src/utils/`: cryptography and token helpers, deterministic score utilities
- `src/database/`: Prisma connection and lifecycle
- `src/modules/`: feature-first domain modules
- `src/routes/`: API route composition and version surface
- `src/docs/`: runtime OpenAPI definition
- `src/types/`: global type augmentation (Express request context)
- `src/app.ts`: middleware pipeline and route registration
- `src/server.ts`: bootstrap and process startup

## Module Pattern

Each module follows a consistent extension-friendly structure:

- `*.routes.ts`: HTTP mapping and middleware composition
- `*.controller.ts`: transport orchestration
- `*.service.ts`: domain logic and transaction coordination
- `*.repository.ts`: persistence abstraction where lifecycle/session data is critical
- `*.schemas.ts`: Zod request contracts
