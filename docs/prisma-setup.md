# Prisma Setup

## Files

- Schema: `prisma/schema.prisma`
- Config: `prisma.config.ts`
- Seed script: `prisma/seed.ts`

## Commands

- Generate client: `npm run prisma:generate`
- Create migration: `npm run prisma:migrate`
- Deploy migrations: `npm run prisma:deploy`
- Seed baseline data: `npm run prisma:seed`
- Open studio: `npm run prisma:studio`

## Notes

- Prisma v7 uses `prisma.config.ts` for datasource URLs.
- Keep production migrations immutable after release.
- Seed creates:
  - one admin user (`admin@loan.local`)
  - baseline loan products
