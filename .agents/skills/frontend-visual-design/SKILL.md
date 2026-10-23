---
name: frontend-visual-design
description: >-
  Use when the user asks to improve how a UI looks, polish or refactor the visual layer, audit an interface against visual craft standards, or choose type, color, spacing, layout, motion, or UI copy for a screen or component.
---
# Frontend Visual Design Instruction (UI Craft)

You are my frontend visual design partner. This guide activates when I ask
to design, evaluate, or refactor the visual layer of a frontend: how a UI
looks, its hierarchy, typography, color, spacing, action hierarchy, empty
states, shadows, contrast, grouping, layout rhythm, motion, responsive
behavior, and interface copy. It works for new UIs and for polishing or
hardening existing ones.

It pairs with `$frontend-design` for structure, journeys, and states;
`$frontend-visual-direction` for creating or replacing a visual identity;
`$frontend-architecture` and `$angular-implementation` for implementation;
`$engineering` and `$refactoring` for UI refactor work; and
`$code-review-frontend` for the visual audit lens during review. It follows
the shared
[software engineering lifecycle standard](../../standards/software-engineering-lifecycle.md).

## When to use

- Designing the visual layer for a new screen or feature.
- Improving how an existing UI looks: layout polish, type, color, spacing,
  motion, buttons, empty states, shadows, or contrast.
- Removing common visual anti-patterns or fixing an interface that reads
  generic, loud, flat, or assembled.
- Refactoring a UI's visual style during development.
- Reviewing a UI against visual craft and quality-floor standards.

Boundaries: `$frontend-design` owns journeys, information architecture,
and component structure; this skill starts where structure ends. Creating
or replacing a whole visual identity routes to `$frontend-visual-direction`.
Implementation routes to `$angular-implementation` or `$engineering`.

## Workflow

1. Scope: the screen, component, or page; the surface context and visitor
   mode (Persuade, Operate, Read, Experience); the user goal and primary
   action.
2. Ground: when the surface context matters, read
   [references/modes.md](references/modes.md). When a fix will touch UI
   code or markup, read
   [references/craft-floor.md](references/craft-floor.md) so the quality
   floor and anti-pattern list apply by construction. When the scope is a
   full page or new surface, or the surface carries data, comparisons, or
   argument, also read the shared
   [ui-design-craft standard](../../standards/ui-design-craft.md) for
   composition, evidence, and review order before the per-principle
   passes.
3. Evaluate: for each relevant principle, read its reference and apply
   its checks. Note violations with location and severity (critical,
   high, medium, low).
4. Generate or fix: produce concrete specs (type scale, palette, spacing
   scale, layout thesis, motion plan, button styles, empty-state copy) or
   a targeted fix list with before/after specifics.
5. Report: a full pass returns a prioritized report grouped by severity
   with the most impactful fixes first. A targeted pass returns the change
   list for the principle in scope. For each principle evaluated, state
   the outcome explicitly: keep as is when the current design is sound,
   improve with the prioritized fix list, or advise the best combination
   when choices exist. Preserve the project's existing design system
   unless a fix is agreed. A full-page or data-bearing pass closes by
   checking the ui-design-craft standard's review order: first read,
   language, composition, evidence, restraint, themes and reflow, trust
   and access.

## References

Read the reference when its principle is in scope; do not load all of them
for a targeted fix.

| Principle | Reference | Focus |
|---|---|---|
| UI design craft (shared) | [ui-design-craft standard](../../standards/ui-design-craft.md) | Plan the job, compose the surface, honest evidence, review order |
| Visitor modes | [references/modes.md](references/modes.md) | Mode and register before type, color, motion, density |
| Craft floor | [references/craft-floor.md](references/craft-floor.md) | Quality checks, browser surfaces, anti-patterns to refuse |
| Visual hierarchy | [references/hierarchy.md](references/hierarchy.md) | What draws attention first, second, third |
| Typography scale | [references/typography.md](references/typography.md) | Hand-crafted sizes, weights, line heights, measure |
| Color palette | [references/color.md](references/color.md) | Neutrals, primary, and accent shades with roles |
| Spacing system | [references/spacing.md](references/spacing.md) | Systematic scale, rhythm, whitespace |
| Layout and rhythm | [references/layout.md](references/layout.md) | Reading order, grouping, density, structure |
| Motion | [references/motion.md](references/motion.md) | Purposeful animation, timing, reduced motion |
| Responsive adaptation | [references/responsive.md](references/responsive.md) | Context rethinking, breakpoints, input detection |
| UI copy | [references/copy.md](references/copy.md) | Message hierarchy, errors, labels, states |
| Button hierarchy | [references/buttons.md](references/buttons.md) | Primary, secondary, tertiary, destructive |
| Clutter removal | [references/clutter.md](references/clutter.md) | Borders, backgrounds, separators, decoration |
| Empty states | [references/empty-states.md](references/empty-states.md) | Helpful, actionable zero-content screens |
| Shadows | [references/shadows.md](references/shadows.md) | Elevation and interaction, not decoration |
| Color contrast | [references/contrast.md](references/contrast.md) | WCAG AA readability |
| Element grouping | [references/grouping.md](references/grouping.md) | Proximity shows relationships |

For a full pass, work in this order: modes, hierarchy, typography, color,
spacing, layout, buttons, clutter, empty states, shadows, contrast,
grouping, then copy and motion where in scope. Close by checking the
craft-floor list against the result.

## Guardrails

- New designs are proposals until I approve them; targeted fixes can be
  applied when asked.
- Preserve an existing design-token system when refactoring; extend it
  before introducing ad hoc values.
- Refinement preserves the incumbent visual world; redesign replaces it.
  Never split the difference into polish on a discarded look, and never
  use a polish pass to smuggle in a replacement.
- The brief wins: honor pinned aesthetics, fonts, and palettes even when
  they conflict with general guidance, and ask before replacing factual
  copy or adding claims.
- Contrast is an accessibility requirement; never relax WCAG AA numbers
  without explicit approval.
- Framework-agnostic; no component code under this skill.
- No claims of passing checks or tests unless I ran them.
- Attribution: principles adapted from Refactoring UI by Adam Wathan and
  Steve Schoger, and from the impeccable frontend design skill (Apache
  2.0); these skills are not affiliated with or endorsed by Tailwind Labs.

