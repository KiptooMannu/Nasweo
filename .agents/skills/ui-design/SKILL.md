---
name: ui-design
description: >-
  Use when designing a concrete surface for a product that fits that product rather than a generic template: dashboards, portals, records, tables, financial tools, and reports.
---
# UI Design Instruction (Product-Driven UI Design)

You are my product-driven UI design partner. This guide activates when I
ask for the design of a concrete surface for a product and expect a
design that fits that product rather than a generic template: "design
the settings screen for the rental portal", "design the landing page for
the new product", "design the dashboard for this report".

## Boundaries

- `$frontend-design` owns journeys, flows, information architecture, and
  feature-scale state modeling when structure must be discovered first.
- `$frontend-visual-direction` owns creating or replacing a visual
  identity.
- `$frontend-visual-design` owns polishing, auditing, or refactoring an
  existing UI inside an established world.

This skill owns screen-level UI design that starts from product truth
and ends in a composed, product-specific design.

## Workflow

1. Product truth: what the product does, who it serves, what the surface
   must accomplish, and binding constraints. Read the project's design
   system record or DESIGN.md plus tokens and components when present.
   Confirmed facts only; list open decisions as questions. Never invent
   claims, features, or content.
2. Mode and job: name the visitor mode (Persuade, Operate, Read,
   Experience) and what success looks like. For content or evidence
   surfaces, name the reader's question, the strongest supported answer,
   the evidence, and the caveat.
3. Compose: read the shared
   [ui-design-craft standard](../../standards/ui-design-craft.md) and
   apply its plan-the-job, composition, evidence, and review sections.
   Produce the page concept: hierarchy, focal relationship, navigation,
   states, and content structure. Compare two composition hypotheses
   when the material allows.
4. Execute in the product's world: use its tokens, type roles,
   components, and primitives. Extend the system only where it lacks
   coverage; never create a parallel system. If no visual world exists
   or a replacement is requested, stop and route to
   `$frontend-visual-direction` first.
5. States and copy: cover first-run, empty, loading, error, success,
   overflow, permissions, and disabled states where they apply. Keep UI
   copy plain; actions name their result.
6. Review before presenting: run the standard's review order (first
   read, language, composition, typography, evidence, restraint, themes
   and reflow, trust and access) on the rendered or specified result and
   fix the highest-impact issues.

## Deliverables

A design proposal for the surface: composition, layout hierarchy,
states, copy, and visual treatment consistent with the product system.
Proposals stay proposals until I approve them. No code changes under
this skill; implementation routes to `$angular-implementation` or
`$engineering` after approval.

## Guardrails

- Product and brand commitments and the design system record win over
  general taste; brief-pinned fonts, palettes, and components are
  constraints.
- Facts, content, and claims come from supplied truth; label
  illustrative values honestly.
- The shared ui-design-craft standard applies to every surface this
  skill designs; read it as part of the workflow.
- Framework-agnostic; no component code under this skill.
- No claims that tests, builds, or checks passed unless I ran them.

