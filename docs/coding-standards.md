# Apex Performance Coding Standards

This document outlines the coding standards for the Apex Performance project, a dual-platform MVP featuring a React Progressive Web App (PWA), Flutter mobile application, and Supabase backend. It incorporates base and enterprise rules from the .opencode/rules guidelines, tailored for TypeScript, Dart, and Node.js technologies. These standards ensure secure, maintainable, and scalable code aligned with the project's goals.

## 0. Guiding Objectives

All code must be:

- **Secure by Design**: Zero exploitable vulnerabilities by default.
- **SOLID & Clean**: Extensible, readable, and refactor-friendly.
- **Maintainable**: New developers productive within one day.
- **Testable**: 100% business logic coverage with deterministic tests.
- **User-Centric**: Accessible, performant, and observable.
- **Enterprise-Ready**: Compliant, auditable, and operable at scale.

## 1. SOLID Principles

- **S** (Single Responsibility): Each module/class has one reason to change.
- **O** (Open-Closed): Extend via interfaces/abstract classes, not modification.
- **L** (Liskov Substitution): Subtypes are substitutable; avoid type-casting.
- **I** (Interface Segregation): Keep interfaces small and role-specific.
- **D** (Dependency Inversion): Depend on abstractions, not concretions.

## 2. Security

- Validate and sanitize all external inputs at boundaries.
- Use parameterized queries/prepared statements; ban string concatenation.
- Store secrets in environment variables or vaults; never in code or logs.
- Enforce TLS for all network calls.
- Apply least privilege for file system and cloud permissions.
- Integrate static analysis and dependency scanning in CI (e.g., ESLint for TypeScript, dart analyze for Dart, npm audit for Node.js).

## 3. Maintainability

- **Naming**: Use intention-revealing names; avoid abbreviations.
- **DRY**: Extract reusable logic into pure functions/utilities.
- **YAGNI**: Add abstractions only when duplication occurs.
- **KISS**: Prefer straightforward code over clever one-liners.
- **Comments**: Explain _why_, not _what_; minimize TODOs with dates.
- **File Length**: ≤ 300 lines; split into focused modules.
- **Function Length**: ≤ 40 lines; extract helpers for nested code.

## 4. Testability

- Write tests before or with code (TDD-friendly).
- Unit tests < 1s each; mock external services.
- 100% branch coverage for business logic; integration tests for critical paths.
- Tests alongside code (e.g., `*.test.ts`, `*_test.dart`).
- Structure: Arrange → Act → Assert.
- Use table-driven tests for data-heavy modules.
- Fix or remove failing tests immediately.

## 5. Tooling & Automation

- Pre-commit hooks: Lint, format, run unit tests.
- CI fails on lint warnings or test failures.
- Automated dependency updates with review (e.g., Dependabot).

## 6. UX / CX (User & Customer Experience)

- **Design Tokens**: Store in versioned JSON/YAML for consistency.
- **Accessibility**: WCAG 2.2 AA; automate with axe-core/Lighthouse.
- **Progressive Disclosure**: Surface key value quickly; lazy-load extras.
- **Error Handling**: User-friendly messages with next steps.
- **Feature Flags**: Enable/disable UI changes; instant rollback.
- **Telemetry**: Measure TTFB and TTI; integrate analytics.

## 7. Architecture

- **12-Factor App**: Stateless, env config, stdout logs.
- **Domain-Driven Design**: Maintain context map; update on boundary changes.
- **API First**: OpenAPI specs; version for breaking changes.
- **Zero-Trust**: JWT with scopes; mTLS for services.
- **Idempotence**: Use Idempotency-Key for mutations.
- **Event-Driven**: Async events; Outbox pattern for DB/publish.
- **Data Strategy**: OLTP for consistency; OLAP for analytics; no direct DB from UI.

## 8. Logging, Monitoring & Observability

- **Pillars**: Metrics (Prometheus), Logs (JSON to Loki), Traces (OpenTelemetry).
- **Cardinality**: ≤ 500 label values per metric.
- **SLI/SLO**: Define in YAML; enforce budgets.
- **Alerts**: Only for >1% customer impact or $1k/h revenue.
- **Correlation IDs**: Propagate via headers; inject into logs.
- **PII Redaction**: Automatic scrubbing.

## 9. QA / UAT

- **Test Pyramid**: 70% unit, 20% integration, 10% e2e.
- **Contract Tests**: Pact for consumer-driven testing.
- **Mutation Testing**: Stryker for assertion strength.
- **Performance Gates**: Block merges on latency/memory thresholds.
- **Ephemeral UAT**: PR-based review apps with synthetic data.
- **Deployments**: Canary/blue-green with auto-rollback.
- **Chaos Engineering**: Quarterly GameDays.

## 10. Business Analysis & Requirements

- **Living Requirements**: Markdown in `docs/requirements/`; reference IDs in PRs.
- **INVEST Stories**: Independent, Negotiable, Valuable, Estimable, Small, Testable.
- **Gherkin Criteria**: Committed; auto-convert to e2e tests.
- **Impact Mapping**: Link epics to KPIs; auto-update dashboards.
- **Traceability**: Requirement → Story → Commit → Test → Deployment.

## 11. DevOps & Release Engineering

- **IaC**: Terraform/CloudFormation; PR includes plan diff.
- **GitFlow**: Main, develop, feature/release branches; signed tags.
- **Semantic Versioning**: MAJOR.MINOR.PATCH; bump on breaking changes.
- **SBOM**: CycloneDX/SPDX; CVE scans.
- **Rollback SLA**: <5 min via Helm/traffic switch.

## 12. Documentation & Knowledge Sharing

- **ADRs**: One per decision in `/docs/adr/`; retire obsolete ones.
- **Onboarding**: `make dev` for containerized env; productive in <1 day.
- **API Docs**: Auto-generate from OpenAPI specs.

## 13. Language-Specific Overrides

### TypeScript (React PWA)

- **Formatting**: Prettier with 2-space indent, 100-char lines.
- **Linting**: ESLint with Airbnb config; ban `any`.
- **Imports**: Absolute paths; group by external/internal.
- **Testing**: Jest with React Testing Library.

### Dart (Flutter Mobile)

- **Formatting**: `dart format`; 2-space indent, 80-char lines.
- **Linting**: `flutter_lints`; enforce null safety.
- **State Management**: Provider or Riverpod for consistency.
- **Testing**: Flutter test framework.

### Node.js (Supabase Backend)

- **Formatting**: Prettier; 2-space indent, 100-char lines.
- **Linting**: ESLint with Node.js config.
- **Async**: Use async/await; ban callbacks.
- **Security**: Helmet, rate limiting.
- **Testing**: Jest or Mocha.

## 14. Review & Governance

- Quarterly review by tech leads and security team.
- Decommission obsolete rules to `/docs/retired-rules/` with rationale.
