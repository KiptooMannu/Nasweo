---
name: ui-design-craft
description: >-
  Shared convention for planning, composing, and reviewing product UI without AI clichés. Focuses on honest evidence, reader job, two reading speeds (executive and audit), typography hierarchy, and deliberate composition.
---
# UI Design Craft Standard

Shared convention for planning, composing, and reviewing a product UI.
It applies when a surface is designed, built, or reviewed through
`$frontend-design`, `$frontend-visual-design`, `$ui-design`, or
`$code-review-frontend`. It supplies the layers those skills share: the
reader's job, composition, honest evidence, restraint, and the review
loop. It never supplies a look. Per-principle craft checks such as type
scales, color roles, spacing tokens, component states, and WCAG AA
contrast stay with the frontend skill references that enforce them.

Conflict order: the user's explicit request wins, then tagged project
documentation and the product's design system record, then this standard.

## 1. Plan the job

Before any layout, name what the surface must do for the person who
reaches it:

- Who arrives, in what context, to decide, understand, or do what.
- The strongest supported answer, recommendation, or outcome.
- The evidence or content that earns that answer.
- The caveat, uncertainty, or limit that could change the reading.

Support two reading speeds on content-bearing surfaces:

- An executive path: the identity, headings, decisive values, and
  conclusion communicate the argument quickly, in plain language the
  least specialized named stakeholder can repeat.
- An audit path: exact tables, assumptions, methodology, sources, units,
  and qualifiers preserve the record for anyone who needs to check it.

Write copy that simplifies language, never the claim. Preserve every
qualifier, unit, population, period, and comparison basis that changes
meaning. Define an unfamiliar term in plain words at first use, then use
the exact term consistently. Keep the skill's own authoring vocabulary
out of page copy: words such as hierarchy, composition, and mediation
describe the work; they do not belong on the surface. Never present a
precise test condition as a broader human claim.

Name the visitor mode per surface, not per product: Persuade (decide and
act), Operate (complete a task), Read (understand something), or
Experience (be inside the work). State what success looks like and what
would make a polished result feel wrong.

Record confirmed facts as facts and undecided facts as open decisions.
Do not invent intent, ownership, urgency, deadlines, approvals, or
claims. Keep exhaustive ledgers available behind the decision path, but
let the first read carry only what the decision needs.

## 2. Compose the surface

Choose the composition from the material, never from the document or
product category. Before designing, name the obvious layout the category
suggests and reject it unless the material earns it. When the material
admits multiple structures, compare two composition hypotheses that
change topology, density, or evidence placement, not just palette or
component choice.

Map the material to a visual variable:

- Magnitude or rank: position or length on a common scale.
- Change over time: horizontal order and aligned position.
- Composition or proportion: proportion.
- Threshold or range: distance from a boundary.
- Process or dependency: connection and sequence.
- Qualitative alternatives: aligned rows or deliberately contrasted
  columns.

Use tables for precise lookup, prose for one conclusion, and charts only
for relationships that become faster to read visually. Do not default to
bars because values exist.

Compose the page as a field, not a stack of components:

- Establish one page-level throughline and one focal relationship per
  reading moment or major section.
- Surround each focal object with few supporting objects and enough open
  space to amplify its local hierarchy.
- Pace the scroll deliberately. Vary density and quiet while keeping one
  visual grammar. Repetition creates rhythm only when the repeated items
  are true peers.
- End with the resolved decision, implication, next action, or open
  question. Let sources and the footer follow quietly.

Give every artifact one organizing move that belongs to its material and
could not be transplanted unchanged into an unrelated page. It must
clarify the subject, not decorate it.

Run two tests before coding:

- Squint test: at a glance, the dominant claim or evidence is obvious
  and the reading path is stable.
- Text-mask test: with the words blurred, the hierarchy still
  communicates identity, emphasis, grouping, and progression.

If every block has equal weight, redesign before coding. Create presence
through commitment, not additional effects: when the page feels too
safe, strengthen one focal relationship through proportion, hierarchy,
density, pacing, or placement, and make supporting content quieter.
Never fill an evidence gap with panels, borders, icons, color fields, or
decoration.

## 3. Execute in the product's world

Use the product's committed visual system when one exists: the tokens,
type roles, components, and CSS or platform primitives from the design
system record or DESIGN.md. Extend the system before introducing ad hoc
values, and never run a parallel visual system beside it.

Establish hierarchy through typography before surfaces or color:

- Equivalent peers share roles, size, weight, alignment, and numeric
  treatment. Never resize one peer because its string is longer.
- Give every gap one owner. Within-group gaps are tight, between-group
  gaps larger, and section turns clearly larger. Do not let children add
  competing default margins.
- Keep prose near 60 to 68 characters per line. Rewrite before shrinking.
- Inspect important line breaks and fix stranded words by improving the
  copy or measure, not by shrinking one element.

Design surfaces and color by meaning:

- Monochrome is the default. Color appears only when it adds meaning to
  state, action, or data, and always with a non-color cue.
- Earn a surface or boundary only when it communicates selection,
  interaction, warning, contrast, or a grouping that spacing cannot
  express.
- Diagnose quantity separately from intensity. A busy page needs less
  content or better grouping; a loud page needs fewer competing colors,
  sizes, weights, borders, and effects.
- Preserve one deliberate anchor. Restraint must not flatten the page
  into neutral sameness.

When the surface has no established visual world, the direction is
chosen and recorded before execution. Do not invent a half-system while
composing a page.

## 4. Keep evidence honest

Make the visual encoding honest:

- Show units, periods, populations, bases, and material comparators
  near the evidence they qualify.
- Use zero baselines for length encodings unless a clearly marked range
  or delta view better answers the question.
- Share one documented scale across peer bars, charts, and rows. Length
  must encode the value; otherwise use aligned text.
- Choose count or rate from the reader's question when denominators
  differ. Never compare raw numerators as though the bases were equal.
- Prefer direct labels to legends. Give every chart label a clear lane
  and a caption that states what to notice and what the chart does not
  establish.
- Provide a semantic table or concise text alternative for material
  chart data.

Treat tables as evidence, not decoration:

- Use a semantic table with caption, head, and body.
- Match each column header's alignment to its cells: text left, numbers
  right, including placeholders and totals.
- Keep peer units and precision consistent. Do not add fake precision.
- Align body rows on the first text baseline.
- Group repeated categories with row groups instead of repeating the
  same label down a column.
- Reorder columns around the reader's lookup task before shrinking or
  wrapping them.
- Give dense evidence enough width. A table with five or more columns
  owns the full section width; never clip or shrink headers to preserve
  a neighboring prose rail.

Treat interaction as evidence:

- Define one canonical state model: variables, fixed inputs, formulas,
  units, full precision, ranges, defaults, and dependencies.
- Give one control to each variable; fixed parameters are not controls.
- Update dependent outputs atomically from full-precision state, then
  format for display.
- Use native controls with visible labels, clear units, visible focus,
  and keyboard support. Preserve invalid entries and the last valid
  result instead of silently clamping or defaulting.

Never exaggerate differences, hide small differences, or let a chart's
salience disagree with its argument. The decisive series, exception, or
threshold receives the strongest emphasis; supporting evidence recedes
without becoming illegible.

## 5. Motion, media, and icons

Default to stillness:

- Add motion only when it explains a state change, preserves continuity,
  or confirms an action.
- Respect reduced-motion preferences. Keep the base experience complete
  without motion.
- Never gate reading behind animation, reveal every section on scroll,
  or add bounce, parallax, sound, or spectacle.

Use media and icons only when they are evidence or materially improve
understanding:

- Prefer text labels unless an established icon makes an action faster
  to recognize.
- Do not add stock imagery, decorative illustration, fake screenshots,
  or mandatory hero media to fill space.
- Do not place icons in colored tiles or use them as decoration.

## 6. Review the result

Render the actual result when tooling exists. Review in this order:

1. First read: if someone saw only the first viewport, would they
   remember the central relationship or decision, not just the title or
   mood?
2. Language: can the least specialized stakeholder explain the answer
   from headings and captions? Are qualifiers and limits preserved?
3. Composition: is there one dominant object? Does each section advance
   the argument? Is any empty space accidental?
4. Typography: are roles consistent, peers equal, baselines aligned, and
   gaps owned?
5. Evidence: does the geometry prove the claim? Do repeated rows share
   exact label, plot, value, and annotation lanes? Are tables full width
   and correctly aligned? Are charts captioned and honest?
6. Restraint: can any surface, border, icon, color, paragraph, or
   section be removed without losing meaning or rhythm? If yes, remove
   it.
7. Themes and reflow: do light and dark keep equivalent hierarchy and
   contrast? Does the page recompose without overflow?
8. Trust and access: are semantics, focus, labels, text alternatives,
   sources, caveats, and interaction behavior sound?

Fix the highest-impact systemic defect, render again, and repeat until
no material issue remains. Keep this work internal. Deliver the
requested result, not a score, process diary, or self-critique, unless
the user asks for one.

## Refuse these generated-design defaults

These are defaults to reject unless the brief explicitly earns them:

- Generic centered hero copy followed by a card grid.
- Repeated metric boxes when one composed relationship is clearer.
- A badge, pill, or capsule for ordinary metadata or editorial labels.
- Cards used to repair weak hierarchy, or cards nested inside cards.
- Decorative gradients, gradient text, glows, blobs, stripes,
  textures, glass, paper simulations, and ornamental shadows.
- All-caps eyebrows, kickers, overlines, and decorative section
  numbers.
- Identical section silhouettes across unrelated reader questions.
- Repeated summary, recommendation, and rationale sections that restate
  the same answer at equal prominence.
- A dark rounded rectangle around every chart, calculator, or metric.
- Arbitrary icon tiles, oversized icons, or mixed icon styles.
- Tiny muted prose, arbitrary font sizes, and inconsistent peer values.
- A narrow table floating inside a wide section, or a wide table
  compressed into broken words.
- Decorative charts, legends that replace direct labels, and color
  without meaning.
- Repeated full-width bars that do not share a scale.
- Authoring-process narration, visible theme controls, stock imagery,
  fake screenshots, and decorative brand marks.

Avoiding these defaults is not an excuse for a sterile anti-design
template. Replace each refused default with a decision that shows the
material's own structure: precise hierarchy, honest evidence, and
deliberate tension.

## Provenance

Distilled from the product-specific design skill draft supplied in
`drafts/design.md` (retired with this change) and generalized for any
product UI. The craft principles behind it are recorded in the vault's
frontend skills and the ui-ux-craft learning topic, with attribution to
Refactoring UI, the impeccable frontend design skill (Apache 2.0), and
the platform design guidance cited there.

