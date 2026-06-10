# Kinetic Coach Storyboard

Diese statische Website sammelt die generierten App-Screens, Planner-User-Storys und Storybook-Komponentenvarianten in einem minimalistischen Storyboard.

Datei:

```text
docs/storyboard/index.html
```

Direkt öffnen:

```bash
xdg-open docs/storyboard/index.html
```

Oder mit einem lokalen Server:

```bash
python3 -m http.server 4173 --directory docs/storyboard
```

Dann:

```text
http://127.0.0.1:4173/
```

Zusätzliche Checks:

```bash
npm run check-types
npm run build-storybook --workspace @workout/shared-components
```
