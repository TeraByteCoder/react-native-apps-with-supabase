# CDD Resource

CDD means Component-Driven Development. Keep this separate from the tech-stack resource.

## Rules

- Build reusable UI as isolated components before wiring complete screens.
- Cover reusable components in Storybook.
- Model important visual states: default, loading, empty, error, disabled, and success where relevant.
- Keep components small enough to understand and test.
- Use prototypes as visual intent, not as copy-paste HTML/CSS source for React Native.

## Prototype Translation

When planning from HTML/CSS prototypes:

1. Identify reusable components and one-off screen layout parts.
2. Convert CSS intent into React Native style constraints.
3. Preserve spacing, hierarchy, and interaction states.
4. Create worker tasks for component extraction, screen composition, Storybook coverage, and validation separately when needed.
