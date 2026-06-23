# Manual API Verification Guide

## Happy Path

1. Register customer (`POST /api/auth/register`)
2. Login customer (`POST /api/auth/login`)
3. Fetch profile (`GET /api/me`)
4. List products (`GET /api/loan-products`)
5. Submit application (`POST /api/loan-applications`)
6. Run eligibility (`POST /api/eligibility/check`)
7. Admin login (`POST /api/auth/admin/login`)
8. Admin approve (`POST /api/admin/applications/:id/approve`)
9. Admin disburse (`POST /api/admin/disbursements/:id`)
10. Customer status tracking (`GET /api/loan-applications/:id/status`)

## Security Checks

- Access protected endpoint without token -> 401
- Customer hits admin endpoint -> 403
- Invalid payload -> 400 with standardized error body
- Burst traffic beyond limit -> 429
- Refresh token rotation -> old token should fail after refresh
