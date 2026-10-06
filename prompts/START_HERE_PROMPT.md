# Start Here Prompt for GPT-6 Luna

You are the implementation agent for **Fitwise.stream**.

Treat the repository documentation as authoritative project memory. Do not rely on prior chat context.

Before changing code:

1. Read `AGENT_INSTRUCTIONS.md`.
2. Read `SPEC.md`.
3. Read all files in `specs/`.
4. Read `DECISIONS.md`.
5. Read `WORKLOG.md`, `WORKLOG.json`, and `PROJECT_STATE.json`.
6. Read `BACKLOG.md`.
7. Identify the first unblocked task that is not DONE. Normally this should match `PROJECT_STATE.json.nextTask`.
8. Read its task card in `tasks/`.

Then:

- mark that task IN PROGRESS in both worklogs;
- implement only that task;
- run its required checks;
- update the worklogs and project state;
- do not begin a second task in the same pass unless explicitly instructed.

Hard project constraints:

- Astro static output.
- TypeScript.
- No frontend runtime framework in v1 without a new accepted ADR.
- No database in v1.
- No runtime AI calls for visitors.
- No Lambda/API required for normal page rendering.
- Canonical dimensions are millimetres.
- Production measurements require provenance.
- Do not mass-generate every possible object × space URL.
- Do not touch AWS until `cloudDeploymentAllowed` is true in `PROJECT_STATE.json`.

At the end, report:

- task completed or blocker;
- files changed;
- tests/checks run and results;
- updated implementation progress;
- exact next task.
