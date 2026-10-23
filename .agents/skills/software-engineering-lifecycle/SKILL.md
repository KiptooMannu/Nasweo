---
name: software-engineering-lifecycle
description: >-
  Shared convention for how software work proceeds: Understand, Design, Implement, Test, Review. Used for engineering lifecycle, planning gates, and architectural governance.
---
# Software Engineering Lifecycle Standard

Shared convention for how software work proceeds in this vault and in
projects: Understand, Design, Implement, Test, Review. It is used by
`$planning`, `$engineering`, and `$code-review`; any task that plans,
builds, or reviews software follows it.

## Understand

- New project: requirements and planning analysis come before any code.
  Establish the problem, users, required behavior, acceptance criteria,
  and constraints before design.
- Existing project: understand what it does before changing it. Read its
  documentation; when documentation does not exist, for example a work
  project, create a notes dock under `workspace/<project>/` with a README
  and `docs/` covering what the project does, the stack, and the important
  documents used when analyzing it, including architecture.
- Never write code to discover the problem; the domain understanding comes
  first.

### Decision quality

- Frame the real problem and desired outcome before accepting a requested
  mechanism as the solution.
- Separate must-have requirements and constraints from preferences, and ask
  only questions whose answers could change the solution.
- Surface trade-offs that threaten safety, data integrity, compatibility,
  operability, or hard-to-reverse decisions.
- Design relevant failure behavior in proportion to the risk, then choose the
  simplest solution that satisfies the requirements.
- Reuse existing project documentation, approved plans, decisions, and domain
  knowledge when they still fit; update the reasoning when new evidence makes
  them stale.

## Design

- System architecture, HLD, LLD, and documentation. The goal is to map the
  business problem to reality so the documents make engineering easy.
- Produce the documents the change needs: architecture, data flow,
  interfaces, schemas, and testing strategy.
- Match design depth to scope and risk; no ceremony for small changes.

## Implement

- Coding happens after the plan is approved and the domain is understood.
- Follow `$planning` gates and `$engineering` conventions: scoped
  increments, production-grade quality, and verification honesty.
- Approved multi-phase work carries a live `plan.md` execution file via
  `$live-plan`: phases, Ledger, and Resume here, updated at phase close and
  deleted on completion.

## Test

- Intentional tests only, following `$test`. Tests map how the system or a
  feature is meant to operate once changes are made.
- Cover failure modes where necessary: error paths, invalid input, edge
  cases, and degradation behavior.
- Unit and integration tests that achieve something real; update related
  existing test files instead of creating new ones when the area is already
  covered.
- No unnecessary tests, such as testing a div. Each test must earn its
  place by mapping intended behavior or a real failure mode.

## Review

- Code review follows `$code-review`: the base skill, plus the area skills
  (`code-review-backend` and `code-review-frontend`) when they exist.
- Reviews verify the change against the plan, the tests, and the
  repository conventions, and check that the tests are intentional and
  cover the relevant failure modes.

## Verification

- When documents change, run `$markdown-audit` and the
  `$docs-consolidation` link checker over the touched files.
- Never claim tests or builds passed unless the user ran them.

