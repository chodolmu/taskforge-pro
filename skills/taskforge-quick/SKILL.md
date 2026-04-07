---
name: taskforge-quick
description: Runs a quick single task without a plan. Use when the user says "/taskforge-quick", "fix this", "change this", "tweak", "just do it", or similar. Skips the discover→plan process and executes immediately. Suitable for small edits, bug fixes, and single-file work.
---

# Quick — Quick Execution

Execute a task immediately without going through discover→plan. Suitable for small edits, bug fixes, and single-file work.

## When to Use

- Modify or create a single file
- Simple bug fixes
- Style/CSS changes
- Config file edits
- Small feature additions

## When Not to Use

For larger work, starting from `/taskforge-discover` is recommended:
- Changes spanning multiple files
- Work that requires architecture decisions
- Features that need multiple steps

## Usage

```
/taskforge-quick Change login button color to blue
/taskforge-quick Add installation instructions to README
/taskforge-quick Add lodash dependency to package.json
```

## Execution Flow

### 1. Analyze the Request

Parse the request to:
- Understand what needs to change
- Identify relevant files (file tree scan)
- Rate difficulty (easy/medium/hard)

### 2. Load Conventions (if project exists)

If `_workspace/conventions.md` exists, read it before making changes.
Follow established patterns — colors, naming, file structure, etc.

### 3. Determine if a Skill Is Needed

If domain expertise would help, auto-load a relevant skill from `harnesses/`.
Example: Security-related fix → inject api-security-checklist skill

### 4. Execute

- Execute in a clean context
- Apply changes following project conventions
- Run automated validation (build, lint, etc.)

### 5. Report Result

```
✅ Done: "Change login button color" (haiku, 12s, $0.001)
   Changed: src/components/LoginButton.css
   Validation: lint ✅
```

## Notes

- Quick does not generate a handoff or changelog
- If a project is in progress, quick reads conventions but does not modify project state
- If the user tries to use Quick for large work, suggest: "I'd recommend starting with `/taskforge-discover` for this"
