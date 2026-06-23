# Deployment Guide

## Development

1. Provision PostgreSQL and Redis (local/docker).
2. Configure `.env`.
3. Run migrations and seed.
4. Start API using `npm run dev`.

## Staging

1. Build immutable Docker image.
2. Inject staging secrets via secret manager.
3. Run `npm run prisma:deploy` during release.
4. Validate `/health`, `/ready`, smoke test auth + application flow.

## Production

1. Use managed PostgreSQL and Redis with HA setup.
2. Terminate TLS at reverse proxy/load balancer.
3. Enforce HTTPS redirect and secure cookies.
4. Run migrations in controlled deployment stage.
5. Roll out with canary or blue/green strategy.
6. Monitor logs, metrics, and error rates.

## Reverse Proxy Considerations

- Forward real client IP to preserve accurate rate limiting/audit IPs.
- Add request size limits and timeout policy at edge.
- Set strict transport security headers and secure cookie forwarding.
