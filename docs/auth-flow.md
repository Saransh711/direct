# Authentication Flow

## Register

1. Validate input with Zod.
2. Enforce password strength and confirmation.
3. Hash with Argon2id.
4. Persist customer record.

## Login

1. Validate credentials.
2. Verify password hash.
3. Issue short-lived access token.
4. Issue refresh token with unique JTI.
5. Store JTI in `RefreshToken` table with device/IP metadata.
6. Set refresh token in HTTP-only cookie.

## Access-Controlled APIs

- Access token sent as bearer token.
- Middleware validates token and injects authenticated user context.
- RBAC middleware enforces CUSTOMER, ADMIN, SUPER_ADMIN role policy.

## Logout

- Current device logout revokes current refresh token JTI.
- Global logout revokes all active refresh tokens for user.
