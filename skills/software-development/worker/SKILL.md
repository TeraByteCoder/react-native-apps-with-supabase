---
name: worker
description: "Use when a focused, bounded repository task must be executed for the workout platform, such as parsing prototypes, generating artifacts, checking files, or packaging output."
version: 1.0.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [execution, automation, packaging, verification, support-task]
    related_skills: [planner, manager, builder]
---

# Worker Skill

## Overview

The worker skill handles narrow execution tasks that support planner, manager, and builder. It is for concrete, bounded work such as scanning files, generating JSON, indexing prototypes, running checks, updating a ZIP, or collecting evidence.

Worker should be fast, careful, and verifiable. It should not redesign the app or make broad architectural decisions.

## When to Use

- A manager asks for a focused repository check.
- A builder needs generated support artifacts before coding.
- Prototype files need to be indexed, parsed, zipped, or summarized.
- The final submission ZIP must be rebuilt.
- A command output or file existence check is needed as evidence.

Do not use this skill to define requirements or own broad implementation. Use planner and builder for those tasks.

## Typical Tasks

Examples of suitable worker tasks:

- Count and list skill files under `skills/software-development`.
- Validate SKILL.md frontmatter and required sections.
- Run a prototype parsing script and save JSON output.
- Rebuild a submission ZIP after files change.
- Run `npm run check-types` and collect the exact result.
- Compare expected deliverables with existing files.

## Execution Workflow

1. Restate the exact bounded task in one sentence.
2. Identify the minimum files or commands needed.
3. Run the command or perform the file operation.
4. Capture the exact output, count, path, or checksum when useful.
5. Report only facts and blockers to manager.

## File Safety Rules

- Do not edit broad app files unless explicitly assigned.
- Prefer creating generated artifacts in documented output paths.
- Do not delete source files unless manager explicitly requires cleanup.
- Avoid stale ZIPs: rebuild after relevant source files change.
- Keep command output concise but include enough evidence to verify the task.

## Skill Validation Task

For this assignment, worker can validate the four role skills with:

```bash
python3 - <<'PY'
from pathlib import Path
import re, yaml
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
    assert end != -1, path
    fm = yaml.safe_load(text[3:end])
    assert fm['name'] == name
    assert 'description' in fm and len(fm['description']) <= 1024
    for section in ['## Overview', '## When to Use', '## Common Pitfalls', '## Verification Checklist']:
        assert section in text, f'{path}: missing {section}'
print('OK: four role skills validated')
PY
```

## Common Pitfalls

1. Doing more than the assigned task. Worker should stay bounded.
2. Reporting assumptions as facts. Only report what was checked.
3. Forgetting to rebuild generated artifacts after source changes.
4. Hiding command failures. Report blockers immediately.
5. Using stale paths. Always run from the repository root unless told otherwise.

## Verification Checklist

- [ ] Task scope is small and explicit.
- [ ] Commands ran from the correct working directory.
- [ ] Output paths, counts, or command results were captured.
- [ ] No unrelated files were changed.
- [ ] Manager can use the result as evidence.
