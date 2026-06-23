# Database Design

## Principles

- UUID primary keys across all domain entities
- Explicit enums for role/status and decision state safety
- Foreign keys with cascade/restrict strategy by lifecycle semantics
- Indexed fields for frequent filtering (status, userId, createdAt, revoked)
- Soft delete support where lifecycle retention is required (`User`, `LoanApplication`)

## Key Entities

- `User`: identity, role, status, lifecycle
- `RefreshToken`: rotation state and session-level revoke support
- `LoanProduct`: policy and product constraints
- `LoanApplication`: loan request and workflow state
- `EligibilityAssessment`: immutable-style evaluation output per application
- `CreditReport`: bureau response history
- `CreditBureauRequest`: integration reliability telemetry
- `LoanDecision`: admin approval/rejection trace
- `LoanDisbursement`: disbursement execution event
- `AuditLog`: event forensic ledger
- `Notification`: customer communication records
- `SystemConfiguration`: runtime policy extension point

## Cascade Strategy

- User -> RefreshToken / CreditReport / BureauRequest / Notification: `Cascade`
- User -> LoanApplication: `Restrict` to preserve financial records
- LoanApplication -> Eligibility/Decision/Disbursement: `Cascade`
- AuditLog.userId: `SetNull` to keep logs if user is removed

## Retention Notes

- Soft deletes used to preserve compliance and reporting history.
- Audit logs and decisions are designed for immutable retention in production.
