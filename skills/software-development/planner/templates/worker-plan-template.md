# Worker Plan Template

Use this template for planner output. The planner should fill worker tasks from prototype evidence instead of writing final user stories as the primary deliverable.

```text
Prototype input:
- Source: <file/path/url/screenshot>
- Screens/states observed: <list>
- Main intent: <what the prototype is trying to achieve>

WT-<number>: <short worker task title>
Worker type: ui-worker | backend-worker | docs-worker | validation-worker | packaging-worker
Prototype evidence:
- <specific screen/component/style/interaction from the HTML/CSS prototype>
Affected paths:
- <path>
Dependencies: <WT ids or none>
Conflict risk:
- <files or outputs that must not be edited in parallel>
Task scope:
- <small implementation/check/doc/package scope>
Acceptance checks:
- <concrete observable result>
- <concrete observable result>
Resources for manager to include:
- skills/software-development/planner/resources/<file>.md#<section>
Verification:
- <command or manual check>
Manager dispatch notes:
- <parallel/sequential hints>
```

End with:

```text
Manager handoff:
- Total worker tasks: <n>
- Suggested parallel groups:
  - Group A: WT-01, WT-02
- Sequential blockers:
  - WT-03 waits for WT-01
- Required final checks:
  - npm run check-types
  - skill validation script
```
