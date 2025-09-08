# Enterprise Coding Standards
<!-- Kilo Code / OpenCode universal enterprise rules -->
<!-- Save as: .kilocode/rules/001-enterprise.md  or  AGENTS.enterprise.md -->
<!-- Language-specific rules may extend or override sections via ## Language Overrides -->

---

## 0. Guiding Objectives
All code delivered under this repository must be:
- **Secure by Design** – zero exploitable surface by default.  
- **SOLID & Clean** – extensible, readable, refactor-friendly.  
- **Maintainable** – new engineers productive in < 1 day.  
- **Testable** – 100 % of business logic covered by deterministic tests.  
- **User-Centric** – accessible, performant, observable.  
- **Enterprise-Ready** – compliant, auditable, and operable at 24×7 scale.

---

## 1. UX / CX (User & Customer Experience)
- **Design Tokens First**  
  Store colours, spacing, typography in a **versioned JSON/YAML** file consumed by code and Figma.

- **Accessibility by Default**  
  - WCAG 2.2 AA minimum.  
  - Automated a11y tests run in CI (axe-core, Lighthouse).  

- **Progressive Disclosure**  
  Surface 80 % of value in ≤ 20 % of clicks; lazy-load secondary features.

- **Error Copy is UX**  
  Every 4xx/5xx message explains *what happened* and *what the user should do next*.

- **Feature Flags**  
  All UI changes behind kill-switches; rollback within 30 s without redeploy.

- **Interaction Telemetry**  
  Measure time-to-first-byte **and** time-to-first-interaction; store in product analytics.

---

## 2. Architecture
| Principle | Concrete Rule |
|---|---|
| **12-Factor App** | Stateless services, config in env, logs to stdout. |
| **Domain-Driven Design** | Maintain `/docs/context-map.cml`; PRs that cross boundaries must update the map. |
| **API Contract First** | OpenAPI specs committed to repo; breaking change = major version bump + consumer approval. |
| **Zero-Trust** | Every internal call uses JWT with least-privilege scopes; mTLS between services. |
| **Idempotence** | All mutating endpoints accept `Idempotency-Key`; duplicates return cached 200/201. |
| **Event-Driven** | Async events for cross-domain workflows; use Outbox pattern for atomic DB & publish. |
| **Data Strategy** | OLTP → strong consistency; OLAP → eventual; no direct DB access from UI layer. |

---

## 3. Logging, Monitoring & Observability
- **Three Pillars**  
  - Metrics → Prometheus  
  - Logs → JSON to ELK/Loki  
  - Traces → OpenTelemetry  

- **Cardinality Budget**  
  ≤ 500 unique label values per metric.

- **SLI / SLO**  
  Define in `slos.yaml`; every new endpoint lists latency & error budgets.

- **Alert Hygiene**  
  Alert only if customer impact > 1 % or revenue > $1 k/h.

- **Correlation IDs**  
  Propagated via `X-Correlation-ID`; automatically injected into logs.

- **PII Redaction**  
  Automatic scrubbing before logs leave the pod.

---

## 4. QA / UAT
- **Test Pyramid**  
  - Unit 70 %  
  - Integration 20 %  
  - e2e 10 %  

- **Contract Tests**  
  Consumer-driven Pact tests run on every PR.

- **Mutation Testing**  
  Stryker/Pitest to ensure assertions kill mutants.

- **Performance Gates**  
  Merge blocked if p95 latency > 150 ms or memory > baseline +10 %.

- **Ephemeral UAT**  
  Review apps spun up per PR with synthetic data.

- **Canary & Blue-Green**  
  Deploy to 5 % traffic first; auto-rollback if error-rate > 0.5 %.

- **Chaos Days**  
  Quarterly GameDay with Chaos Monkey; post-mortem within 48 h.

---

## 5. Business Analysis & Requirements
- **Living Requirements**  
  Markdown files in `docs/requirements/*.md`; every merged PR must reference requirement ID.

- **INVEST Stories**  
  Independent, Negotiable, Valuable, Estimable, Small, Testable.

- **Gherkin Acceptance Criteria**  
  Committed next to code; auto-converted to e2e tests.

- **Impact Mapping**  
  Each epic links to measurable KPI; dashboard auto-updated nightly.

- **Traceability Matrix**  
  Requirement → Story → Commit → Test → Deployment stored in Jira/ADO.

---

## 6. DevOps & Release Engineering
| Practice | Rule |
|---|---|
| **Infrastructure as Code** | All infra Terraform/CloudFormation; PR must include plan diff. |
| **GitFlow** | `main`, `develop`, feature branches, release branches; release tags signed (`git tag -s`). |
| **Semantic Versioning** | `MAJOR.MINOR.PATCH+build`; breaking change → MAJOR bump. |
| **SBOM** | CycloneDX or SPDX generated on every build; CVE scan (Grype, Trivy). |
| **Rollback SLA** | < 5 min via `helm rollback` or traffic switch. |

---

## 7. Documentation & Knowledge Sharing
- **ADR (Architecture Decision Records)**  
  One per major decision in `/docs/adr/000X-title.md`; retired ADRs moved to `/docs/adr/retired/`.

- **Onboarding Runbook**  
  `make dev` spins up a containerized dev-env; new engineer productive in < 1 day.

- **Auto-Generated API Docs**  
  Published to developer portal on every merge from OpenAPI specs.

---

## 8. Language-Specific Overrides
If a rule needs language-specific detail, create:
coder/rules/python.md
coder/rules/typescript.md
coder/rules/sql.md
and prefix overrides with:
> *Overrides 001-enterprise §X.Y*  

Example:
## Python Overrides
### 2. Security
- Use `bandit` in pre-commit hook: `bandit -r src/`

---

## 9. Review & Governance
Quarterly Rule Review – Tech-leads and Security team audit .kilocode/rules/.
Rule Decommission – Obsolete rules moved to /docs/retired-rules/ with rationale.