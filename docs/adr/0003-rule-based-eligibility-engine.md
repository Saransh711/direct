# ADR 0003: Rule-Based Eligibility Engine as Initial Policy Layer

## Status

Accepted

## Context

Business policy changes frequently and needs explainability for audits and customer communication.

## Decision

Implement deterministic rule-based scoring with explicit rejection reasons and approval conditions.

## Consequences

- Positive: highly explainable and auditable.
- Positive: easy extension for weighted factors and policy versions.
- Trade-off: less predictive than ML models until future enhancement.
