# ADR 0002: Refresh Token Rotation with Server Registry

## Status

Accepted

## Context

Stateless JWT-only refresh tokens cannot be revoked per device without additional server state.

## Decision

Store refresh token JTIs in database with revocation flags and rotate on every refresh call.

## Consequences

- Positive: per-device logout and global invalidation become enforceable.
- Positive: replay of old refresh token is detectable.
- Trade-off: adds persistence and read/write overhead to refresh flow.
