# Migration Strategy

## Development

1. Update `prisma/schema.prisma`.
2. Run `npm run prisma:migrate` to create and apply migration.
3. Commit migration files under `prisma/migrations`.

## Staging

1. Build immutable image artifact.
2. Run `npm run prisma:deploy` in release job.
3. Run smoke tests against staging API endpoints.

## Production

1. Apply migration using deployment pipeline before traffic shift.
2. Run canary health/readiness checks.
3. Roll forward with new app version.

## Rollback Policy

- Prefer forward-fix migration.
- For severe incidents, rollback app code while preserving schema compatibility.
- Destructive schema changes require explicit two-phase migration strategy:
  - phase 1: additive fields + dual writes
  - phase 2: traffic migration + cleanup
