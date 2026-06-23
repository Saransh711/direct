# Production Readiness Checklist

- [ ] Secrets managed outside source control
- [ ] TLS enforced for all public endpoints
- [ ] Production CORS origins explicitly listed
- [ ] Redis and PostgreSQL high availability configured
- [ ] Migrations tested in staging before production run
- [ ] Backup and restore runbooks validated
- [ ] Alerting configured for 5xx spikes and readiness failures
- [ ] Log aggregation with retention controls enabled
- [ ] Dashboard metrics wired to monitoring platform
- [ ] Pen-test and dependency audit completed
- [ ] Access policies for admin endpoints reviewed
- [ ] Incident response and rollback playbook documented
