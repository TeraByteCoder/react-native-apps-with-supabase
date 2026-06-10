# Workout App Platform

Dieses Projekt beschreibt eine Workout-App-Plattform, die aus zwei Frontends und einem Supabase-basierten Backend besteht:

- einer mobilen Workout-App fuer Endnutzer
- einer Admin-App fuer Web-Nutzer
- einem gemeinsamen UI- und Logik-Layer fuer wiederverwendbare Komponenten

Ziel ist eine saubere Monorepo-Struktur mit gemeinsam nutzbaren Bausteinen, einer klaren Trennung von Presentation, API-Orchestrierung und Domain-Logik sowie einer BaaS-Architektur auf Basis von Supabase.

## Projekt starten

### Voraussetzungen

- Node.js 22+
- npm 11+
- Expo CLI ueber `npx expo`
- optional: Supabase CLI fuer lokale Backend-Workflows

### Installation

```bash
npm install
```

### Development

Das gesamte Monorepo kann ueber Turbo gestartet werden:

```bash
npm run dev
```

Wichtige Einzelkommandos:

```bash
npm run dev --workspace @workout/workout-app
npm run dev --workspace @workout/admin-app
npm run storybook
npm run check-types
npm run build
```

## Aktuelle Monorepo-Struktur

```text
.
|-- apps
|   |-- workout-app
|   |-- admin-app
|-- packages
|   |-- shared-components
|   |-- shared-types
|   |-- shared-utils
|-- supabase
|   |-- config.toml
|   |-- functions
|   |   |-- health
|   |-- migrations
|   |-- seeds
|   |-- tests
|-- docs
|   |-- cdd-workflow.md
|-- .vscode
|   |-- tasks.json
|-- turbo.json
|-- tsconfig.base.json
|-- package.json
|-- README.md
```

## Zielarchitektur

Die Plattform soll aus folgenden Kernbausteinen bestehen:

### Frontends

- `workout-app`: Mobile-Frontend mit React Native und Expo
- `admin-app`: Web-Frontend fuer Administrations- und Backoffice-Funktionen, ebenfalls auf React Native basierend, mit Expo fuer Web
- `shared-components`: Gemeinsamer Komponenten- und Design-Layer fuer beide Frontends

Beide Frontends verwenden damit dieselbe technische Basis und koennen UI-Bausteine, Styles, Form-Komponenten, Validierungslogik und gegebenenfalls Feature-nahe Hooks gemeinsam nutzen.

### Backend

Als Backend wird Supabase eingesetzt. Dabei gilt folgende Aufgabenteilung:

- Supabase Edge Functions nehmen externe API-Calls entgegen
- Edge Functions validieren Requests, orchestrieren Anwendungsfaelle und kapseln Integrationen
- Die eigentliche Business-Logik wird in PostgreSQL SQL Functions umgesetzt
- Persistenz, Authentifizierung, Storage und Realtime koennen ueber Supabase-Standarddienste erfolgen

Diese Aufteilung folgt einem DDD-orientierten Ansatz fuer BaaS-Systeme: Die Fachlogik liegt moeglichst nah an den Daten und Invarianten, waehrend Edge Functions als schlanke Application/API-Schicht dienen.

## Technologie-Stack

### Frontend

- React Native
- Expo
- Expo Router oder vergleichbares Routing-Konzept
- React Native Web fuer die Web-Auslieferung der Admin-App
- Shared Components Package fuer UI-Konsistenz und Wiederverwendung
- Storybook fuer komponentengetriebene Frontendentwicklung
- CDD (Component-Driven Development) als methodischer Ansatz fuer UI-Entwicklung

### Backend / BaaS

- Supabase
- Supabase Edge Functions
- PostgreSQL
- PostgreSQL SQL Functions fuer Domain-Logik
- Supabase Auth
- Supabase Storage bei Bedarf fuer Medien, Trainingsplaene oder Uploads

## Architekturprinzipien

### 1. Monorepo-Ansatz

Alle Anwendungen und gemeinsam genutzten Pakete liegen in einem gemeinsamen Repository. Dadurch koennen Abhaengigkeiten, Typen, Komponenten und Konventionen zentral gepflegt werden.

### 2. Shared-First Frontend Design

Gemeinsam nutzbare Bestandteile werden bewusst in ein eigenes Package ausgelagert, zum Beispiel:

- Buttons, Inputs, Cards, Modals
- Theme, Tokens, Typografie, Farben, Spacing
- Form-Helfer und Validierung
- Domain-nahe UI-Komponenten wie Workout-Karten, Uebungslisten oder Plan-Editoren

Die Frontendentwicklung soll konsequent mit CDD (Component-Driven Development) erfolgen. Komponenten werden dabei zuerst isoliert entworfen, dokumentiert, getestet und anschliessend in Screens und Features integriert.

Storybook dient in diesem Projekt als zentrale Entwicklungs- und Dokumentationsumgebung fuer das gemeinsame UI-System. Dadurch koennen Komponenten unabhaengig von konkreten Screens oder Backend-Anbindungen entwickelt und abgestimmt werden.

Vorgesehene Einsatzbereiche von Storybook:

- isolierte Entwicklung von Basis- und Composite-Komponenten
- visuelle Dokumentation des Design Systems
- Darstellung verschiedener States und Varianten einer Komponente
- engere Abstimmung zwischen Fachlichkeit, Design und Entwicklung
- Grundlage fuer spaetere visuelle Regressionstests

### 3. Edge Functions als API-Schicht

Edge Functions bilden die externe Eintrittsschicht fuer Client-Anfragen. Sie sollen insbesondere:

- Requests entgegennehmen
- Auth-Kontext pruefen
- Payloads validieren
- Domain-Operationen ueber SQL Functions anstossen
- Responses in einer stabilen API-Form zurueckgeben

Die Edge Functions sollen moeglichst wenig Fachlogik enthalten.

### 4. SQL Functions als Domain-Layer

Die eigentliche Business-Logik wird in PostgreSQL SQL Functions gekapselt. Dazu gehoeren zum Beispiel:

- Erstellen und Aktualisieren von Workout-Plaenen
- Zuweisen von Trainings zu Benutzern
- Fortschrittsberechnung
- Auswertung von Trainingshistorien
- fachliche Validierungen und Statuswechsel

Dieser Ansatz passt gut zu DDD fuer BaaS-Systeme, weil Invarianten, Transaktionen und datennahe Regeln direkt auf Datenbankebene konsistent umgesetzt werden koennen.

## DDD fuer BaaS mit Supabase

Im klassischen DDD liegt viel Logik in Services oder Modulen der Backend-Anwendung. In einem BaaS-Kontext wird diese Verantwortung teilweise anders verteilt:

- `Presentation Layer`: Expo Apps fuer Mobile und Web
- `Application Layer`: Supabase Edge Functions
- `Domain Layer`: PostgreSQL SQL Functions, Constraints, Policies und Views
- `Infrastructure Layer`: Supabase als Plattform fuer Datenbank, Auth, Storage und Deployment

Das bedeutet konkret:

- Edge Functions definieren Anwendungsfaelle und API-Grenzen
- SQL Functions modellieren fachliche Regeln und zentrale Operationen
- Row Level Security Policies sichern den Datenzugriff ab
- Gemeinsame Typen sollten aus dem Datenmodell beziehungsweise API-Vertraegen abgeleitet werden

## Vorschlag fuer die Projektstruktur

```text
.
|-- apps
|   |-- workout-app
|   |-- admin-app
|-- packages
|   |-- shared-components
|   |-- shared-types
|   |-- shared-utils
|-- supabase
|   |-- functions
|   |-- migrations
|   |-- seeds
|   |-- tests
|-- docs
|-- README.md
```

Die Struktur ist im aktuellen Setup bereits als Turborepo mit npm Workspaces umgesetzt.

## Verantwortlichkeiten je Bereich

### `apps/workout-app`

- Mobile Nutzererfahrung fuer Trainingsplaene, Workout-Durchfuehrung und Fortschritt
- Fokus auf Performance, Offline-nahe UX und intuitive Navigation

### `apps/admin-app`

- Verwaltung von Uebungen, Trainingsplaenen, Nutzern und Auswertungen
- Bereitstellung als Web-Frontend ueber Expo Web beziehungsweise React Native Web

### `packages/shared-components`

- Design System
- Basis-Komponenten
- zusammengesetzte UI-Komponenten
- gemeinsame Layout- und Interaktionsmuster
- Storybook Stories fuer Komponenten und Varianten
- CDD-orientierte Dokumentation und Wiederverwendung

### `supabase/functions`

- oeffentliche oder interne API-Endpunkte
- Request-Validierung
- Authentifizierungs- und Autorisierungspruefungen auf Use-Case-Ebene
- Orchestrierung von Domain-Funktionen

### `supabase/migrations`

- Tabellen
- Views
- Indizes
- RLS Policies
- SQL Functions fuer Fachlogik

## Storybook und CDD im Setup

Storybook ist im Package `packages/shared-components` vorgesehen. Dort liegen die wiederverwendbaren Komponenten und die zugehoerigen Stories fuer CDD.

Relevante Kommandos:

```bash
npm run storybook
npm run build-storybook
```

Der empfohlene Workflow ist in `docs/cdd-workflow.md` beschrieben.

## Neue Apps und Packages hinzufuegen

### Neue App unter `apps/`

Eine neue App sollte:

- eine eigene `package.json` mit `dev`, `build` und `check-types` Skripten besitzen
- bei Expo mindestens `app.json`, `index.ts` und `App.tsx` enthalten
- gemeinsame UI vorzugsweise aus `packages/shared-components` beziehen
- als eigener Build-Teil in Turbo laufen koennen

### Neues Package unter `packages/`

Ein neues Package sollte:

- ein eigenes `package.json` besitzen
- TypeScript ueber `tsconfig.base.json` erben
- einen klaren Verantwortungsbereich haben, zum Beispiel `shared-hooks`, `api-client` oder `feature-flags`
- nach Moeglichkeit ueber `build` und `check-types` in die Turbo-Pipeline eingebunden sein

## VS Code Tasks

Die Datei `.vscode/tasks.json` stellt vier Basis-Tasks bereit:

- `Turbo Dev`: startet die Entwicklungs-Pipeline des Monorepos
- `Turbo Build`: fuehrt den kompletten Repo-Build aus
- `Clean Install`: entfernt vorhandene `node_modules` und installiert das Repo neu
- `Prisma Studio`: ist als Platzhalter enthalten, da dieses Setup Supabase statt Prisma verwendet

## Beispiel fuer den Request-Fluss

1. Die Mobile-App oder Admin-App sendet einen Request an eine Supabase Edge Function.
2. Die Edge Function prueft Authentifizierung, Berechtigungen und Request-Format.
3. Die Edge Function ruft eine oder mehrere SQL Functions auf.
4. Die SQL Functions fuehren die fachliche Logik transaktional aus.
5. Die Edge Function transformiert das Ergebnis in ein API-Response-Format fuer den Client.

## Fachliche Kernbereiche

Moegliche fachliche Bounded Contexts fuer dieses Projekt sind:

- Workout Management
- Exercise Catalog
- Training Plans
- User Progress
- Coaching / Administration

Fuer jeden dieser Bereiche sollten SQL Functions gezielt pro Use Case entworfen werden, statt generische CRUD-Logik direkt aus dem Client heraus auf Tabellen auszufuehren.

## Entwicklungsziele

- Gemeinsame Codebasis fuer Mobile und Web auf React-Native-Basis
- Hohe Wiederverwendbarkeit durch Shared Components und gemeinsame Utilities
- Komponentengetriebene UI-Entwicklung mit Storybook und CDD
- Klare Trennung zwischen API-Orchestrierung und Business-Logik
- Saubere, testbare und datenbanknahe Fachlogik mit PostgreSQL SQL Functions
- Gute Skalierbarkeit fuer weitere Apps, Features und Admin-Funktionen

## Agent-Skills fuer die Umsetzung

Die Projektarbeit ist in drei Hermes-aehnliche Skills aufgeteilt:

- `planner`: plant die Arbeit und erstellt User Storys mit Akzeptanzkriterien.
- `manager`: nimmt die Planner-Storys und managed Worker-Subagents ueber `delegate_task`.
- `worker`: beschreibt die fokussierten Subagents, die einzelne Storys, Checks, Docs oder Packaging-Aufgaben ausfuehren.

Es gibt keinen separaten `builder` Skill mehr. Umsetzung passiert durch Worker-Subagents, die vom Manager gestartet und geprueft werden.

Die genaue Verwendung und Beispiel-`delegate_task`-Aufrufe sind in `docs/skills-usage.md` beschrieben.

## Moegliche naechste Schritte

1. Shared Components um weitere domain-nahe UI-Bausteine erweitern
2. Erste echte Supabase Edge Function fuer einen Workout-Use-Case aufsetzen
3. RLS- und Rollenmodell fuer Admin- und Endnutzerzugriffe ausarbeiten
4. Storybook um visuelle Review- und Test-Workflows erweitern
5. CI fuer `npm run check-types` und `npm run build` ergaenzen

## Zusammenfassung

Das Projekt setzt auf einen Expo-basierten React-Native-Monorepo-Ansatz fuer Mobile und Web. Im Frontend wird Storybook in Kombination mit CDD verwendet, um Shared Components strukturiert, isoliert und wiederverwendbar zu entwickeln. Das Backend wird mit Supabase umgesetzt, wobei Edge Functions die API-Schicht bilden und PostgreSQL SQL Functions die zentrale Business-Logik enthalten. Damit entsteht eine Architektur, die sowohl Wiederverwendung im Frontend als auch klare Domain-Grenzen und robuste Fachlogik im BaaS-Backend unterstuetzt.