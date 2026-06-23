# Environment Variables Guide

- `NODE_ENV`: development, staging, production
- `PORT`: API port
- `DATABASE_URL`: PostgreSQL connection URL
- `REDIS_URL`: Redis connection URL
- `JWT_ACCESS_SECRET`: secret for short-lived access token signing
- `JWT_REFRESH_SECRET`: secret for refresh token signing
- `JWT_ACCESS_EXPIRES_IN`: access TTL (example: `15m`)
- `JWT_REFRESH_EXPIRES_IN`: refresh TTL (example: `7d`)
- `CORS_ORIGIN`: comma-separated frontend origins
- `COOKIE_DOMAIN`: cookie domain boundary
- `SWAGGER_ENABLED`: expose docs endpoint toggle
- `RATE_LIMIT_POINTS`: request burst limit
- `RATE_LIMIT_DURATION`: rate limit window in seconds
- `BUREAU_MAX_RETRIES`: max bureau retry attempts
- `BUREAU_TIMEOUT_MS`: circuit-breaker timeout for bureau simulation

Use `.env.example` as baseline.
