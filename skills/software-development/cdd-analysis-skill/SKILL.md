---
name: cdd-analysis-skill
description: "Use when HTML/CSS prototypes must be translated into React Native atoms, molecules, organisms, and Storybook stories with deduplicated component tracking."
version: 1.0.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  target_framework: react-native
  methodology: component-driven-development
  storybook: true
  component_layers: [atoms, molecules, organisms]
---

# CDD Analysis Skill

## Overview

This skill turns HTML/CSS prototypes into a reusable React Native component plan. It keeps the implementation aligned with component-driven development (CDD):

- **Atoms** become the smallest reusable UI pieces.
- **Molecules** combine a few atoms into a compact function.
- **Organisms** compose molecules and atoms into a complete screen section.
- **Storybook stories** are created for every implemented component so the result can be rendered, reviewed, and tested in the Storybook server.

The skill is designed for this repository’s layout and should be used together with the shared components package and its Storybook workspace.

## When to Use

- A prototype exists under `docs/ui/prototypes/[app-name]/` and needs to be converted into React Native components.
- Existing prototype HTML files were reindexed and should be deduplicated before implementation.
- New atoms, molecules, or organisms are being added to `packages/shared-components`.
- Every new component also needs a matching Storybook story.
- Component updates should be visible in `npm run storybook --workspace @workout/shared-components` and pass `build-storybook`.

## Repository Structure

Expected source layout for prototype analysis:

```text
docs/ui/prototypes/[app-name]/
├── auth/
│   ├── landing.html
│   ├── registration.html
│   └── login.html
└── overview/
    └── overview.html
```

Expected implementation layout for components and stories:

```text
packages/shared-components/
├── src/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── index.ts
└── stories/
    ├── AtomName.stories.tsx
    ├── MoleculeName.stories.tsx
    └── OrganismName.stories.tsx
```

Prefer this hierarchy when the component count grows. For small cases, a flat component file is acceptable only if it still follows the atom/molecule/organism classification and is exported from `src/index.ts`.

## Pre-Processing

Run the indexing script before making implementation decisions:

```bash
python3 skills/software-development/cdd-analysis-skill/scripts/deduplicate_and_parse.py   --prototype-dir docs/ui/prototypes/kinetic-coach   --output-dir docs/ui/prototypes/kinetic-coach-indexed   --json-out skills/software-development/cdd-analysis-skill/deduplicated-components.json   --zip-out skills/software-development/cdd-analysis-skill/indexed-html-prototypes.zip
```

The script:

- injects `data-agent-id` into visible HTML nodes,
- hashes files and components,
- marks exact duplicates using `duplicate_of`,
- writes indexed HTML into the output directory,
- can optionally archive the indexed HTML as a zip.

## Classification Rules

The agent should classify elements using only `data-agent-id`, tag name, text, attributes, parent/child context, and duplicate groups.

### Atoms

An element is an atom when it is a single UI function that should not be broken down further.

Typical criteria:

- Tags: `button`, `a`, `input`, `label`, `span`, `img`, `p`, `h1`-`h4`, `small`, `strong`.
- It has no meaningful children or only decorative children.
- It represents exactly one action, input, label, text line, icon surface, or badge.
- React Native target: `Text`, `Pressable`, `TextInput`, or a simple `View`.

Examples:

- `data-agent-id="atm-001"` button "Registrieren" -> Button atom.
- `data-agent-id="atm-014"` email input -> TextField atom.

### Molecules

An element is a molecule when it combines 2 to 6 atoms into a small functional unit.

Typical criteria:

- Tags: `form`, `fieldset`, `article`, small `section`, `li`, compact `div` groups.
- Contains multiple atoms, such as label + input or icon + title + duration + badge.
- Has a clear name like `AuthField`, `WorkoutListItem`, `MetricCard`, `NavPillGroup`.
- React Native target: a composed component built from atoms.

### Organisms

An element is an organism when it combines multiple molecules or atoms into a complete screen region.

Typical criteria:

- Tags: large `section`, `main`, `nav`, `header`, or layout containers.
- Contains multiple distinct functional areas or a complete screen section.
- Examples: `LandingHero`, `RegistrationForm`, `OverviewDashboard`, `TopNavigation`.
- React Native target: screen-level or feature-level component.

## Component Implementation Rules

### 1. Keep the atom/molecule/organism boundary strict

- Atoms should not contain business logic that belongs higher up.
- Molecules should not duplicate layout that belongs in an organism.
- Organisms should assemble smaller components rather than reimplement them.

### 2. Export everything from the package index

Every new component must be re-exported from `packages/shared-components/src/index.ts` so apps and stories can import from one place.

### 3. Use React Native primitives

Map HTML and prototype structure like this:

- `div`, `section`, `article`, `main`, `nav` -> `View` or composed component.
- `p`, `span`, `h1`-`h4`, `label` -> `Text`.
- `button`, interactive `a` -> `Pressable` + `Text`.
- `input` -> `TextInput`.
- CSS classes are not copied 1:1; they become `StyleSheet.create` styles or design tokens.
- Avoid web-only assumptions in the RN implementation.

### 4. Match component names to meaning

Use names that describe the functional role, not the HTML tag. Good names are stable enough for Storybook titles and future refactors.

## Storybook Rules

Every implemented component gets at least one Storybook story.

Required story conventions:

- Store stories in `packages/shared-components/stories/`.
- Name files `<ComponentName>.stories.tsx`.
- Use a clear Storybook title path such as `Workout/WorkoutCard`.
- Provide a default `args` object that covers the common case.
- Add 1 to 2 variants for meaningful states, sizes, or content changes.
- Prefer `parameters.layout = 'centered'` for compact components.
- Keep `args` serializable so Storybook controls work cleanly.
- Import the component from the package exports if possible, not from deep internal paths.

Example story shape:

```tsx
import React from 'react';
import { WorkoutCard } from '../src';

const meta = {
  title: 'Workout/WorkoutCard',
  component: WorkoutCard,
  args: {
    title: 'Full Body Session',
    durationInMinutes: 40,
    difficulty: 'Intermediate'
  },
  parameters: {
    layout: 'centered'
  }
};

export default meta;
export const Default = {};
```

## Consolidation

1. Sort `duplicate_groups` by `occurrence_count` descending.
2. Use `canonical_cdd_id` as the master component.
3. Every `duplicate_of` entry becomes a reference to the master, not a separate implementation.
4. If structure is identical but text differs, prefer a parameterized component instead of two separate ones.
5. Only create a new component if the function or semantics are clearly different.

## workflow-progress.json

This file is the checkpoint for analysis and implementation status.

Mandatory fields:

- `current_state`: short status description.
- `prototype_hashes`: hashes of all input HTML files.
- `component_index`: mapping from `cdd_id` to classification and intended React Native target.
- `consolidation`: master/duplicate relationships.
- `dependencies`: which molecules/organisms depend on which atoms.
- `delta_updates`: changes since the last run.
- `next_actions`: next concrete steps.

Storybook-specific state should be reflected here too when relevant, for example whether a component already has a story or still needs one.

## Output Expectations

At the end of the workflow, the agent should have produced:

- an updated `deduplicated-components.json`,
- an updated `workflow-progress.json`,
- a list of planned or implemented React Native components,
- matching Storybook stories for each implemented component,
- verification notes that Storybook renders the new components successfully.

The agent must not hallucinate components that are not supported by `data-agent-id` or consolidation rules.

## Common Pitfalls

1. **Implementing duplicates twice.** Use duplicate groups first so repeated HTML does not produce duplicated React Native components.
2. **Skipping exports.** A component that is not exported from `src/index.ts` often cannot be used in the app or in stories.
3. **Forgetting the story.** Every implemented component needs a story file, otherwise Storybook coverage is incomplete.
4. **Making stories too dynamic.** Keep controls simple and serializable so the Storybook UI remains usable.
5. **Lumping all UI into one organism.** If the result cannot be reused, the component boundaries are too coarse.
6. **Copying web-only CSS assumptions.** React Native styles must be translated, not copied.
7. **Not verifying Storybook.** A story file exists only when it actually shows up in the Storybook server/build.

## Verification Checklist

- [ ] Prototype HTML was indexed and deduplicated.
- [ ] `deduplicated-components.json` contains stable `cdd_id` entries.
- [ ] Components are split into atoms, molecules, and organisms where appropriate.
- [ ] Every implemented component is exported from `packages/shared-components/src/index.ts`.
- [ ] Every implemented component has a matching `*.stories.tsx` file.
- [ ] `npm run storybook --workspace @workout/shared-components` shows the new stories.
- [ ] `npm run build-storybook --workspace @workout/shared-components` succeeds.
- [ ] `workflow-progress.json` reflects the latest component and story status.
