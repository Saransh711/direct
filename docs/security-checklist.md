# Security Checklist

## Implemented Controls

- Helmet security headers
- CORS whitelist via environment config
- Request body size limits (JSON and URL-encoded)
- Zod request validation
- Argon2id password hashing
- Password complexity policy
- JWT access token + rotating refresh token
- HTTP-only refresh token cookies
- SameSite cookie protection
- RBAC middleware for CUSTOMER, ADMIN, SUPER_ADMIN
- Redis-backed rate limiting
- Centralized error contracts with trace IDs
- Correlation IDs for every request
- Pino log redaction for sensitive fields
- Prisma ORM query safety against SQL injection
- Audit logs for major customer/admin/security actions
- Health/readiness/metrics endpoints

## Operational Recommendations

- Enforce HTTPS and HSTS at reverse proxy layer
- Rotate JWT secrets using secret manager
- Enable DB encryption at rest and TLS in transit
- Run SAST/DAST and dependency audits in CI
- Add WAF and bot detection at edge
- Add account lockout and MFA for admin users
