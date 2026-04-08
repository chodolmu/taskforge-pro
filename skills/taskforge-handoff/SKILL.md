---
name: taskforge-handoff
description: Generates a handoff document recording the current task's work history. Use when the user says "/taskforge-handoff", "handoff", "hand over", or similar. Usually called automatically by /taskforge-execute, but can also be used manually.
---

# Handoff — Work History Generation

After a task completes, record the work as a structured handoff document.
The goal is to allow the next agent handling subsequent tasks to understand the necessary context without reading the full history.

## Conditional Handoff (Cost Optimization)

**Not every task needs a full handoff.** Generate handoffs only when they add value:

| Condition | Action |
|-----------|--------|
| Task has downstream dependents (other tasks list this task in `dependencies`) | ✅ Full handoff |
| Task is the last in a wave or sprint | ✅ Full handoff |
| Task has no dependents AND is not last in wave/sprint | ⚡ Lightweight record only |

**Lightweight record** — instead of a full handoff JSON, just append to `execution-state.json`:
```json
{
  "taskId": "m1-s1-t1",
  "status": "completed",
  "filesChanged": ["src/styles.css"],
  "completedAt": "2026-04-08T..."
}
```
No summary, no designDecisions, no nextTaskNotes. Just the changed files list (from git diff).

**Why**: Handoff generation costs tokens — sometimes more than the easy task itself. If no future task reads this handoff, those tokens are wasted.

## Why It Matters

Since each task starts in a fresh context, the handoff is the only way to pass results from a previous task forward.
A good handoff = higher success rate for downstream tasks.

## Handoff Contents

Collect and record the following information:

1. **summary**: 1–3 sentences describing what was done
2. **filesChanged**: List of changed/created files (extracted from git diff)
3. **designDecisions**: Design decisions made (only those that affect downstream tasks)
   - Examples: "Switched from SQLite to JSON file storage", "Chose DOM rendering over Canvas"
4. **knownIssues**: Known problems or TODOs
5. **nextTaskNotes**: Notes for the agent handling the next task

## Storage Format

`_workspace/handoffs/{task-id}.json`:

```json
{
  "taskId": "m1-s1-t1",
  "taskName": "Build HTML skeleton",
  "completedAt": "2026-04-06T15:30:00Z",
  "summary": "Created index.html. Includes Canvas element and base styles.",
  "filesChanged": ["src/index.html", "src/styles.css"],
  "designDecisions": [
    "Canvas size fixed at 800x200 (matches original Chrome Dino game aspect ratio)"
  ],
  "knownIssues": [],
  "nextTaskNotes": "Canvas context not yet set up. Game loop will need getContext('2d')."
}
```

## Automatic vs. Manual

- **Automatic**: Called automatically on `/taskforge-execute` completion. The model that ran the task generates the handoff directly.
- **Manual**: If the user did work themselves and calls `/taskforge-handoff`, analyze the current git diff and generate the handoff.

## Notes

- Only record things in designDecisions that affect downstream tasks. Do not include things like "I used camelCase for variable names."
- Keep the summary concise. Do not explain the entire codebase.
