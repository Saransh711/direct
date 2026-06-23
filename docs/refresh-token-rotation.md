# Refresh Token Rotation Strategy

## Goals

- Prevent long-lived replay risk.
- Support per-device session revocation.
- Detect stale/reused refresh token attempts.

## Rotation Steps

1. Read refresh token from secure HTTP-only cookie.
2. Verify JWT signature and parse JTI.
3. Match active JTI in database (`revoked=false`, `expiresAt > now`).
4. Revoke consumed JTI.
5. Mint new refresh token with new JTI.
6. Persist new JTI and overwrite cookie.

## Security Outcomes

- Reuse of a previously rotated token fails DB validation.
- Session invalidation can be scoped to current device or all devices.
- Token revocation is auditable and queryable.
