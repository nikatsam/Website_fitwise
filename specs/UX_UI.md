# UX/UI Specification

## 1. Brand concept

Name: **Fitwise**  
Primary domain: **fitwise.stream**

Working value line:

> Know what fits before you buy.

The tone should feel practical, precise and calm — closer to a visual reference/manual than an interior-design magazine.

## 2. Homepage

The first interaction should communicate the product immediately.

Suggested hero:

```text
Will it fit?
Plan spaces using real dimensions and clearances.

What are you trying to fit?
[ Monitors ] into [ Desk ]
[ Bed      ] into [ Room ]
```

Below hero:

- Workspace FitChecks.
- Bedroom FitChecks.
- Popular reference matrices.
- How Fitwise calculates fit.

## 3. Result semantics

Use three primary states:

### Fits

Hard footprint and recommended clearance are satisfied.

Example language:

> Fits comfortably — approximately 74 mm remains on each side under these assumptions.

### Tight

Physical object fits, but one or more recommended clearances are missed.

Example:

> It fits physically, but side clearance is below the recommended target.

### Does not fit

Hard footprint exceeds the available space.

Example:

> Does not fit — the configuration is 82 mm wider than the available desk area.

Never rely on green/amber/red alone; always include text/icon semantics.

## 4. Core components

### `FitSummary`

Displays:

- state;
- concise answer;
- required vs available dimensions;
- most important constraint;
- assumption link/toggle.

### `DimensionTable`

Columns/rows should make it easy to compare:

- physical footprint;
- recommended envelope;
- available space;
- remaining margin.

### `AssumptionList`

Clearly distinguish:

- sourced dimensions;
- derived dimensions;
- user inputs;
- recommended clearances.

### `ScaleDiagram`

Reusable primitives:

- space rectangle;
- object rectangle;
- dimension arrows/labels;
- clearance zones;
- optional furniture labels;
- legend.

### `UnitToggle`

Metric / Imperial. Store preference locally only if desired; no account required.

## 5. Workspace FitCheck inputs

MVP:

- desk width;
- optional desk depth;
- monitor count (1/2 initially);
- monitor size preset;
- optional physical width override;
- gap between monitors;
- angled vs flat option only if geometry is implemented robustly;
- side margin target.

Advanced fields should be collapsed under “More assumptions”.

## 6. Bedroom FitCheck inputs

MVP:

- room width and length;
- bed market/type;
- bed orientation;
- frame allowance/default;
- desired side clearance;
- desired foot clearance;
- nightstands optional.

Do not implement a full CAD floor-planner in v1.

## 7. Responsive behavior

### Mobile

- result first;
- diagram fits viewport without horizontal scrolling;
- input controls stacked;
- tables may switch to card/row format;
- tap targets >= reasonable accessible size.

### Desktop

- form and diagram may use side-by-side layout;
- summary remains visually dominant.

## 8. Accessibility

- semantic labels for every form input;
- keyboard operability;
- visible focus states;
- diagrams have text alternatives;
- state is not conveyed by color alone;
- sufficient contrast;
- reduced-motion respected if animation is added;
- heading hierarchy remains logical.

## 9. Visual principles

- restrained design;
- numeric information should scan quickly;
- diagrams should look technical but friendly;
- avoid stock imagery in core reference pages;
- use whitespace and hierarchy rather than decorative card overload.

## 10. Trust signals

Each page should make methodology easy to find:

- “How this is calculated”;
- “Assumptions”;
- source/provenance where material;
- “Last verified” for data that may change.
