# Verwendung der Agent-Skills mit Templates und Resources

Dieses Projekt verwendet drei Rollen-Skills unter `skills/software-development/`:

- `planner`: plant aus HTML/CSS-Prototypen, Screenshots oder UI-Ideen einen Worker-Plan. Er schreibt nicht direkt finale User Storys als Hauptoutput.
- `manager`: orchestriert den Worker-Plan mit `delegate_task` und prueft die Ergebnisse.
- `worker`: fuehrt genau eine kleine Aufgabe aus und liefert Verifikation zurueck.

Wiederverwendbare Vorlagen liegen extra in `templates/`. Spezifische Best Practices und Regeln liegen extra in `resources/`. Dadurch bleibt das wie bei AgentSkills.io sauber getrennt: Skill-Verhalten im `SKILL.md`, Material in Templates/Resources.

## Ordnerstruktur

```text
skills/software-development/
  planner/
    SKILL.md
    templates/worker-plan-template.md
    resources/worker-types.md
    resources/tech-stack.md
    resources/cdd.md
    resources/best-practices.md
    resources/verification-checklist.md
  manager/
    SKILL.md
    templates/delegate-task-template.py
  worker/
    SKILL.md
    templates/worker-report-template.md
```

## Ablauf

```text
1. planner
   -> liest Aufgabe, README und HTML/CSS-Prototypen
   -> extrahiert Screens, Komponenten, States und Interaktionen
   -> erstellt einen Worker-Plan mit WT-Tasks, nicht direkt finale User Storys
   -> trennt Tech Stack, CDD und Worker-Typen ueber Resources

2. manager
   -> nimmt den Worker-Plan
   -> entscheidet Reihenfolge und Parallelisierung
   -> startet fuer jede WT-Aufgabe einen Worker-Subagent mit delegate_task
   -> gibt passende Resources und Templates mit
   -> sammelt Ergebnisse, prueft sie und fordert bei Bedarf Fixes an

3. worker-subagents
   -> jeder Worker bekommt genau eine WT-Aufgabe
   -> implementiert/checkt nur diesen Scope
   -> liefert Changed Files, Verification Output und Blocker zurueck

4. manager
   -> macht finale Checks
   -> erstellt Commit, ZIP oder Push, wenn gefordert
```

## Planner ausfuehren

Dem Planner gibt man die Aufgabe:

```text
Nutze den planner Skill. Lies README.md, die Aufgabe und die HTML/CSS-Prototypen.
Erstelle keinen direkten finalen User-Story-Backlog, sondern einen Worker-Plan nach:
skills/software-development/planner/templates/worker-plan-template.md

Nutze getrennt:
- resources/tech-stack.md fuer Technologien
- resources/cdd.md fuer Component-Driven Development
- resources/worker-types.md fuer Worker-Kategorien
- resources/verification-checklist.md fuer Checks
```

Beispiel-Output:

```text
WT-01: Login Prototype in wiederverwendbare LoginCard planen
Worker type: ui-worker
Prototype evidence:
- docs/storyboard/index.html zeigt Card-Layout mit E-Mail/Passwort-Feldern und CTA
Affected paths:
- apps/workout-app
- packages/shared-components
Dependencies: none
Conflict risk:
- Login-Komponenten nicht parallel mit anderem UI-Worker bearbeiten
Task scope:
- React-Native-Komponente und Storybook-Story fuer LoginCard umsetzen
Acceptance checks:
- LoginCard zeigt Default- und Loading-State in Storybook
- Typecheck laeuft ohne neue Fehler
Resources for manager to include:
- planner/resources/tech-stack.md#Frontend
- planner/resources/cdd.md#Rules
- planner/resources/worker-types.md#ui-worker
Verification:
- npm run check-types
Manager dispatch notes:
- Kann parallel zu Backend-Doku laufen, aber nicht parallel zu anderem Login-UI-Task.
```

## Manager mit Subagents ausfuehren

Der Manager bekommt die Planner-Ausgabe und startet Worker-Subagents mit dem Template:

```text
skills/software-development/manager/templates/delegate-task-template.py
```

Wichtig:

- Eine WT-Aufgabe pro Worker.
- Nur relevante Resource-Auschnitte in den Worker-Kontext geben.
- CDD und Tech Stack nicht zusammenmischen.
- Tasks, die dieselben Dateien bearbeiten, nicht parallel starten.

## Worker ausfuehren

Worker werden normalerweise nicht direkt vom User gestartet, sondern vom Manager als Subagents.

Ein Worker bekommt immer:

- genau eine WT-Aufgabe,
- betroffene Pfade,
- passende Resource-Auschnitte,
- Acceptance Checks,
- Verification Command,
- Return Format aus `worker/templates/worker-report-template.md`.

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
for required in [
    root/'planner/templates/worker-plan-template.md',
    root/'manager/templates/delegate-task-template.py',
    root/'worker/templates/worker-report-template.md',
    root/'planner/resources/worker-types.md',
    root/'planner/resources/tech-stack.md',
    root/'planner/resources/cdd.md',
    root/'planner/resources/best-practices.md',
    root/'planner/resources/verification-checklist.md',
]:
    assert required.exists(), required
print('OK: Skills, Templates und Resources sind vorhanden und strukturiert')
PY
```

## Kurzfassung

- Planner macht aus HTML/CSS-Prototypen einen Worker-Plan.
- Manager orchestriert diesen Plan mit Worker-Subagents.
- Worker erledigen Umsetzung, Checks, Docs oder Packaging.
- Templates liegen extra in `templates/`.
- Worker-Typen, CDD, Tech Stack, Best Practices und Verification Checklist liegen extra in `resources/`.
- CDD wird nicht mit Tech Stack gemischt.
- Builder gibt es nicht mehr.
