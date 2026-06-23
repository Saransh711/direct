# ADR 0001: Feature-First Modular Architecture

## Status

Accepted

## Context

The platform requires multiple evolving domains (auth, eligibility, credit, admin, disbursement) with separate ownership and lifecycle.

## Decision

Adopt feature-first modules with layered internals to isolate domain changes while preserving transport and persistence consistency.

## Consequences

- Positive: reduced coupling, clear ownership boundaries, easier onboarding.
- Trade-off: cross-module workflows require explicit orchestration.
