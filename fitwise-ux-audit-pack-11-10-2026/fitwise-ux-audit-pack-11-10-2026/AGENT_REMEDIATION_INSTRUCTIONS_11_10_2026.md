# Fitwise Agent Instructions — UX11 Remediation Cycle

Primary source of truth for this cycle: `UX_audit_11_10_2026.md`.

## Rules

1. Do not redesign the calculator UX from scratch. The newest Power Rack / Storage-style calculator shell is the target pattern.
2. Work on one `UX11-*` issue at a time unless a documented dependency requires a paired change.
3. Prefer shared components, schemas, result state models and field metadata over page-level patches.
4. Do not mark an issue verified after checking only one route if it affects a shared component.
5. Preserve calculation behaviour unless the UX issue explicitly identifies a calculation defect.
6. Add regression tests for every shared change.
7. Run accessibility tests for any form/navigation changes.
8. Keep `UX_audit_10_10_2026.md` unchanged as historical context.
9. Update `UX_audit_11_10_2026.md` statuses and remediation log after each task.
10. Only `✅ VERIFIED` weights count toward the 100-point score.

## Required regression sample

After shared-shell changes test at minimum:

- `/workspace/` — legacy/core migration target
- `/appliances/fridge-fit/` — intermediate/manual-dependent target
- `/home-gym/power-rack-room-size/` — newest-shell reference
- `/storage/what-fits-in-storage/` — exact-fit reference

## Completion standard

A remediation issue is complete only when:

- implementation is shared where appropriate;
- automated tests exist;
- acceptance criteria pass locally/staging;
- live/staging retest is recorded;
- issue status is `✅ VERIFIED`;
- remediation log is updated.
