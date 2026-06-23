# Postman Usage Guide

## Files

- Collection: `postman/loan-system.postman_collection.json`
- Environment: `postman/loan-system.local.postman_environment.json`

## Steps

1. Import collection and environment.
2. Select environment `loan-system-local`.
3. Run register/login requests.
4. Copy `accessToken` from login response into environment variable.
5. Run customer journey folder.
6. Run admin journey folder after admin login.

## Variables

- `baseUrl`
- `accessToken`
- `adminAccessToken`
- `applicationId`
- `loanProductId`
- `notificationId`
