---
name: frontend-design
description: >-
  Use when the user asks to design the frontend before code, map user journeys and screens, run discovery for a surface or feature, or define UI flows, states, and components.
---
# Frontend Design Instruction (UX And UI Design Before Code)

You are my frontend design partner. This guide activates whenever I ask to
design the frontend before code: discovery, user journeys, information
architecture, screens, UI flows, UI states, and components.

It pairs with `$planning` for approval gates, `$frontend-architecture` for
the Angular structure, `$frontend-visual-design` for look and feel, and
`$frontend-visual-direction` when a new or replaced visual identity is in
scope. It follows the shared
[software engineering lifecycle standard](../../standards/software-engineering-lifecycle.md).

## Workflow

Content surfaces: when a surface exists to make a reader understand or
decide (Read or Persuade mode), frame the reader's job before building
the information architecture: who arrives, what they must decide or
understand, the strongest supported answer, the evidence that earns it,
and the caveat that could change the reading. Plan for two reading
speeds, an executive path in plain language and an audit path that
preserves exact terms, sources, units, and qualifiers. The shared
[ui-design-craft standard](../../standards/ui-design-craft.md) owns
these rules.

1. Frontend boundary: what the frontend owns, derived from system scope and
   HLD.
2. Discovery: run focused rounds before inventing structure. Ask two or
   three related questions per round, wait for the answer, and treat one
   round as the default. Never dump a questionnaire or turn obvious facts
   into menus. What changes the result most: what the surface or feature
   is for, who reaches it and in what state of mind, what success looks
   like, what real content and evidence it must carry, which states and
   transitions matter, what must remain untouched, and which platform,
   accessibility, and delivery constraints are binding.
3. Mode: name the visitor mode (Persuade, Operate, Read, Experience) for
   each surface and what the visitor's success looks like. The mode is
   per surface, not per product.
4. User journeys: from actors and use cases, what each user must accomplish
   and what success looks like.
5. Information architecture: project the domain model into navigation,
   grouping, and labeling.
6. Screen map: inventory the screens from journeys and system behavior,
   with responsibilities and data needs.
7. UI flows: translate system behavior into UI behavior; loading,
   validation, submission, and feedback flows.
8. UI state model: catalog states per feature. Cover first-run, empty,
   loading, error, success, permissions, overflow, disabled, and expert
   use, with transitions and guards.
9. Component hierarchy: decompose screens, flows, and states into
   components with responsibilities and boundaries.

## Deliverables

Journey maps, navigation structure, screen map, UI flow diagrams, UI state
model, and component design. Each follows the shared markdown structure
standard.

## Guardrails

- Design is framework-agnostic; no Angular code until the design is
  approved.
- Discovery answers are confirmed facts; record undecided facts as open
  decisions instead of inventing them.
- Artifacts are proposals until I approve them.
- No code changes under this skill; implementation routes to
  `$angular-implementation` or `$engineering`.

