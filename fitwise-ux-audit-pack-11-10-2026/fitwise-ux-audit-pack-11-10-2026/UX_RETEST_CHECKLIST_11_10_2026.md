# Fitwise UX Retest Checklist — 11 October 2026

Use this checklist after any UX11 remediation item that changes shared calculator components.

## Global shell

- [ ] Global grouped navigation is identical across sampled routes.
- [ ] Breadcrumb is visible and accurate.
- [ ] H1 states the question/use case clearly.
- [ ] `Before you start` exists and is service-specific.
- [ ] Example data is clearly labelled.
- [ ] Example result becomes user result after edit.

## Form

- [ ] All controls have visible labels.
- [ ] All controls have accessible names.
- [ ] Related fields are semantically grouped.
- [ ] Advanced settings are optional and collapsed appropriately.
- [ ] Unit behaviour matches site standard.
- [ ] Detailed help is collapsed but discoverable.
- [ ] Help examples actually match the field.

## Result

- [ ] Fits state tested.
- [ ] Tight state tested.
- [ ] Does not fit state tested.
- [ ] Needs information state tested where relevant.
- [ ] Exact-fit state tested.
- [ ] Result explains the bottleneck/constraint.
- [ ] Result provides a useful next action.
- [ ] Calculation details remain available.

## Accessibility

- [ ] Keyboard-only completion possible.
- [ ] Focus state visible.
- [ ] axe-core (or equivalent) has no serious/critical calculator violations.
- [ ] No generic `[Input]` / unnamed controls in accessibility tree.

## Mobile

- [ ] No horizontal form overflow.
- [ ] Long calculators use progressive groups/sections.
- [ ] Result remains easy to reach.
- [ ] Calculation table is mobile-readable or presented as cards.
- [ ] Help popovers/accordions fit viewport.

## Content / navigation

- [ ] Related checks are relevant to the user's current task.
- [ ] No duplicated nav/footer links.
- [ ] No legacy `More assumptions` text.
- [ ] No double punctuation/debug-style generated copy.
