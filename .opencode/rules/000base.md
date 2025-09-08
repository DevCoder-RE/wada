# Base Coding Rules
<!-- Kilo Code / OpenCode universal baseline -->
<!-- Language-specific overrides go in ./python.md, ./typescript.md, etc. -->

---

## 1. SOLID Principles
- **S** – Each module / class has exactly one reason to change.  
- **O** – Use interfaces / traits / abstract base classes so new features are added via extension, not modification.  
- **L** – Subtypes must be substitutable; no “instanceof” or type-casting in callers.  
- **I** – Keep public interfaces small; split fat interfaces into role-specific ones.  
- **D** – Depend on abstractions (interfaces or pure functions), never on concrete implementations.

---

## 2. Security
- Never trust external input – validate & sanitize at every boundary.  
- Prefer parameterized queries / prepared statements; string concatenation is banned.  
- Secrets live only in environment variables or vaults – never in source or logs.  
- All network calls must use TLS unless explicitly documented as insecure.  
- Use the principle of least privilege for file system and cloud permissions.  
- Add static analysis and dependency scanning to CI (Bandit, Semgrep, Trivy, Snyk, etc.).

---

## 3. Maintainability
- **Naming** – Intention-revealing names over comments; avoid abbreviations.  
- **DRY** – Extract reusable logic into pure functions or shared utilities.  
- **YAGNI** – Don’t add speculative abstraction; refactor when duplication appears a second time.  
- **KISS** – Prefer straightforward imperative code over clever one-liners.  
- **Comments** – Explain *why*, not *what*; keep TODOs minimal and dated.  
- **File length** – Aim for ≤ 300 lines; break into focused modules earlier.  
- **Function length** – Single-screen rule (~40 lines); deeply nested code → extract helpers.

---

## 4. Testability
- Write tests **before** or **with** the code (TDD-friendly).  
- Unit tests must run in < 1 s each; external services mocked or faked.  
- 100 % branch coverage for new business logic; integration tests for critical paths.  
- Tests live next to the code (`*_test.py`, `*.spec.ts`, etc.) and use the same naming.  
- Each test has three parts: Arrange → Act → Assert (AAA).  
- Prefer property-based or table-driven tests for data-heavy modules.  
- Never skip failing tests – fix or delete immediately.

---

## 5. Tooling & Automation
- Pre-commit hooks: lint, format, run unit tests.  
- CI pipeline fails on any lint warning or test failure.  
- Add automated dependency updates (Renovate / Dependabot) with mandatory review.

---

## 6. Language-Specific Extensions
When a language appears in the repo, create  
`.coder/rules/{language}.md`  
and extend these rules with concrete style/format choices (indent width, line length, formatter, linter, etc.).

<!-- End of file -->