# Verwendung der drei Agent-Skills mit Subagents

Dieses Projekt verwendet jetzt drei Rollen-Skills unter `skills/software-development/`:

- `planner`: plant die Arbeit und schreibt User Storys mit Akzeptanzkriterien.
- `manager`: nimmt die Storys vom Planner und managed Worker-Subagents.
- `worker`: beschreibt, wie ein einzelner Subagent eine Story oder Hilfsaufgabe ausführt.

Es gibt keinen `builder` Skill mehr. Umsetzung passiert durch Worker-Subagents, die vom Manager gestartet werden.

## Ablauf

```text
1. planner
   -> liest Aufgabe, README, Prototypen und User-Wunsch
   -> erstellt kleine User Storys
   -> definiert Akzeptanzkriterien, betroffene Pfade und Worker-Typen

2. manager
   -> nimmt die Planner-Storys
   -> entscheidet Reihenfolge und Parallelisierung
   -> startet fuer jede Story einen Worker-Subagent mit delegate_task
   -> sammelt Ergebnisse, prueft sie und fordert bei Bedarf Fixes an

3. worker-subagents
   -> jeder Worker bekommt genau eine Story oder eine kleine Aufgabe
   -> implementiert/checkt nur diesen Scope
   -> liefert Changed Files, Verification Output und Blocker zurueck

4. manager
   -> macht finale Checks
   -> erstellt Commit, ZIP oder Push, wenn gefordert
```

## Planner ausfuehren

Dem Planner gibt man die Aufgabe:

```text
Nutze den planner Skill. Lies README.md und die Aufgabe. Erstelle User Storys mit:
- Story ID
- Rolle, Ziel, Nutzen
- Priority
- Worker type
- affected paths
- acceptance criteria
- verification
- manager handoff
```

Der Planner erzeugt zum Beispiel:

```text
US-01: Login Screen als wiederverwendbare UI planen
As a Visitor,
I want a clear login screen,
so that I can access the workout app.

Priority: Must
Worker type: ui-worker
Affected paths:
- apps/workout-app
- packages/shared-components
Dependencies: none
Acceptance criteria:
- Given reusable UI is touched, when implementation is done, then Storybook contains a story for the component.
Verification:
- npm run check-types
```

## Manager mit Subagents ausfuehren

Der Manager bekommt die Planner-Ausgabe und startet Worker-Subagents mit `delegate_task`.

Ein einzelner Worker:

```python
delegate_task(
    goal="Execute US-01: Login Screen als wiederverwendbare UI",
    context="""
    You are a worker subagent for this repository.

    STORY:
    <vollstaendige Planner-Story einfuegen>

    RULES:
    - Stay inside affected paths.
    - Do not invent extra scope.
    - Add Storybook stories when reusable UI changes.
    - Run the verification command when possible.

    RETURN FORMAT:
    - Summary
    - Changed files
    - Verification command and exact result
    - Blockers/follow-up
    """,
    toolsets=["terminal", "file"]
)
```

Mehrere unabhaengige Storys parallel:

```python
delegate_task(tasks=[
    {
        "goal": "Execute US-01: Login UI",
        "context": "<vollstaendige Story + Regeln + Return Format>",
        "toolsets": ["terminal", "file"]
    },
    {
        "goal": "Execute US-02: Skills usage docs",
        "context": "<vollstaendige Story + Regeln + Return Format>",
        "toolsets": ["terminal", "file"]
    }
])
```

Wichtig: Storys, die dieselben Dateien bearbeiten, nicht parallel starten.

## Worker ausfuehren

Worker werden normalerweise nicht direkt vom User gestartet, sondern vom Manager als Subagents.

Ein Worker bekommt immer:

- genau eine Story oder kleine Aufgabe,
- betroffene Pfade,
- Akzeptanzkriterien,
- Verification Command,
- Return Format.

Der Worker liefert zurueck:

```text
Summary:
- ...
Changed files:
- ...
Verification:
- Command: ...
- Result: ...
Acceptance criteria status:
- [x] ...
Blockers/follow-up:
- none
```

## Finaler Manager-Check

Am Ende prueft der Manager:

```bash
git status --short
npm run check-types
python3 - <<'PY'
from pathlib import Path
import yaml
root = Path('skills/software-development')
expected = ['planner', 'manager', 'worker']
actual = sorted(p.name for p in root.iterdir() if p.is_dir())
assert actual == sorted(expected), actual
for name in expected:
    path = root / name / 'SKILL.md'
    text = path.read_text(encoding='utf-8')
    assert text.startswith('---')
    end = text.find('
---
', 3)
    assert end != -1
    fm = yaml.safe_load(text[3:end])
    assert fm['name'] == name
    for section in ['## Overview', '## When to Use', '## Common Pitfalls', '## Verification Checklist']:
        assert section in text
print('OK: planner, manager und worker sind vorhanden und strukturiert')
PY
```

## Kurzfassung

- Planner macht Storys.
- Manager managed diese Storys mit Worker-Subagents.
- Worker erledigen Umsetzung, Checks, Docs oder Packaging.
- Builder gibt es nicht mehr.
