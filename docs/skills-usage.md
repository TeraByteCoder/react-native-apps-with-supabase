# Verwendung der vier Agent-Skills

Dieses Projekt verwendet vier Hermes-aehnlich aufgebaute Skills unter `skills/software-development/`:

- `planner`: macht aus Aufgabe, README, Prototypen und Ideen konkrete User Stories.
- `manager`: koordiniert die Arbeit, prueft Deliverables und entscheidet, welcher Skill als naechstes dran ist.
- `builder`: implementiert geplante User Stories in React Native, Storybook, Packages oder Supabase.
- `worker`: erledigt kleine, klar begrenzte Hilfsaufgaben wie Validierung, Parsing, Checks und ZIP-Erstellung.

## Empfohlene Reihenfolge

```text
1. planner  -> User Stories und Akzeptanzkriterien erstellen
2. manager  -> Scope pruefen und Aufgaben verteilen
3. builder  -> Code, Komponenten, Storybook oder Supabase umsetzen
4. worker   -> fokussierte Checks, Artefakte, ZIPs oder Validierung ausfuehren
5. manager  -> finales Review und Abgabecheck
```

## Beispiel: neue Workout-Funktion

1. `planner` schreibt eine User Story, z. B.:
   "Als Athlete will ich meine heutigen Workouts sehen, damit ich direkt starten kann."
2. `manager` prueft Prioritaet, betroffene Pfade und Abhaengigkeiten.
3. `builder` erstellt Komponenten in `packages/shared-components`, nutzt sie in `apps/workout-app` und legt Storybook Stories an.
4. `worker` fuehrt `npm run check-types` aus oder baut die Abgabe-ZIP neu.
5. `manager` prueft, ob Akzeptanzkriterien, Dokumentation und Verifikation passen.

## Beispiel: nur Skills pruefen

Vom Repository-Root aus:

```bash
python3 - <<'PY'
from pathlib import Path
import yaml
root = Path('skills/software-development')
expected = ['planner', 'manager', 'builder', 'worker']
for name in expected:
    path = root / name / 'SKILL.md'
    assert path.exists(), path
    text = path.read_text(encoding='utf-8')
    assert text.startswith('---')
    end = text.find('
---
', 3)
    assert end != -1
    fm = yaml.safe_load(text[3:end])
    assert fm['name'] == name
    for section in ['## Overview', '## When to Use', '## Common Pitfalls', '## Verification Checklist']:
        assert section in text, f'{name}: missing {section}'
print('OK: planner, manager, builder und worker sind vorhanden und strukturiert')
PY
```

## Warum diese Aufteilung?

Die Rollen trennen Denken und Umsetzen:

- `planner` verhindert unklare Anforderungen.
- `manager` verhindert Chaos bei mehreren Dateien und Deliverables.
- `builder` fokussiert auf saubere Umsetzung.
- `worker` liefert schnelle, beweisbare Teilschritte.

Damit sind die Skills so aufgebaut wie typische Hermes Skills: YAML-Frontmatter, Overview, When to Use, konkrete Workflows, Common Pitfalls und Verification Checklist.
