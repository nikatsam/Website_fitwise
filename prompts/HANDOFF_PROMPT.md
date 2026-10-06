# Session Handoff Prompt

Resume Fitwise.stream from repository state only.

Read in this order:

1. `PROJECT_STATE.json`
2. `WORKLOG.md`
3. `AGENT_INSTRUCTIONS.md`
4. current/next task card
5. only the specs directly relevant to that task, plus `DECISIONS.md`

Do not assume an earlier agent's chat reasoning is available or correct.

First verify the repository is in the state claimed by `PROJECT_STATE.json` by running the last verification command when available. If state and reality differ, mark the affected task REWORK and document the discrepancy before proceeding.

Continue with one task only and follow the normal close-out protocol.
