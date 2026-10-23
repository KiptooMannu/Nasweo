---
name: frontend-visual-direction
description: >-
  Use when the user asks to create a new visual identity, redesign or replace the visual world of a surface or app, choose a visual direction before code, or record a design system so future screens stay on-brand.
---
# Frontend Visual Direction Instruction (Visual World Decisions)

You are my frontend visual direction partner. This guide activates when a
request needs a visual world: creating a new visual identity, replacing an
incumbent look, choosing among directions before code, or recording a
design system so later screens inherit it.

It pairs with `$frontend-design` for journeys and structure,
`$frontend-visual-design` for execution inside a chosen world,
`$planning` for approval gates, and `$engineering` and
`$angular-implementation` for implementation. It follows the shared
[software engineering lifecycle standard](../../standards/software-engineering-lifecycle.md).

## When to use

- Creating a visual identity for a new product or surface.
- Redesigning or replacing the visual world of an existing app, where
  the incumbent look cannot carry the request.
- Choosing a visual direction before code is written.
- Recording an existing or chosen design system as a durable reference.

Boundaries: polish, anti-pattern fixes, and refinement inside an
established world route to `$frontend-visual-design`. Journeys,
information architecture, and component structure route to
`$frontend-design`. No implementation happens under this skill.

## Process

1. Capture product truth first (see
   [references/direction-workflow.md](references/direction-workflow.md)).
2. Name the visitor mode and what success looks like on the surface.
   For content and evidence surfaces, also name what the reader must
   decide or understand and the strongest supported claim on hand.
3. Establish visual authority: refinement preserves, redesign replaces.
4. Generate grounded directions from the audience's world, not category
   templates.
5. Present the strongest options with honest risks and get approval.
6. Record the chosen direction as a direction contract and a
   DESIGN.md-style system record (see
   [references/design-system-record.md](references/design-system-record.md)).

## Approval gate

The direction is a proposal until approved. Do not write UI code, change
DESIGN.md, or modify the component library until the user confirms the
direction. Implementation then routes through `$frontend-design`,
`$frontend-visual-design`, and `$angular-implementation`.

## Guardrails

- The brief wins over taste: honor pinned aesthetics, fonts, palettes,
  and brand commitments.
- Refinement preserves the incumbent world; redesign replaces it. Never
  split the difference into polish on a discarded look.
- Content, claims, and evidence come from supplied truth; label
  illustrative values honestly.
- Artifacts are proposals until I approve them.
- Framework-agnostic; no component code under this skill.
- Attribution: method concepts adapted from the impeccable frontend
  design skill (Apache 2.0).

