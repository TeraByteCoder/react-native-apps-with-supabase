# Template only: paste/adapt inside Hermes when manager dispatches workers.

delegate_task(
    goal="Execute WT-<number>: <task title>",
    context="""
    You are a worker subagent for this repository.

    TASK:
    <paste exactly one worker-plan task here>

    RELEVANT RESOURCES:
    <paste only the relevant excerpts from planner/resources/*.md>

    RULES:
    - Stay inside affected paths unless the task explicitly requires more.
    - Do not invent extra scope.
    - Keep CDD guidance separate from tech-stack constraints.
    - If reusable UI is touched, add or update Storybook coverage.
    - Run the listed verification when possible.

    RETURN FORMAT:
    <paste worker/templates/worker-report-template.md>
    """,
    toolsets=["terminal", "file"]
)
