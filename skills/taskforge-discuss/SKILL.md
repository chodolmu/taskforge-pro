---
name: taskforge-discuss
description: Identifies gray areas and records decisions before sprint execution. Use when the user says "/taskforge-discuss", "discuss", "gray areas", "things to decide", "ambiguous parts", or similar. Clarifies implementation direction before execution so downstream agents don't need to ask the user again.
---

# Discuss — Gray Area Identification + Decision Recording

Before sprint execution, identify ambiguous areas where implementation could go in multiple directions (gray areas), discuss them with the user, and record the decisions.

**User = visionary stakeholder. AI = implementing builder.**
Do not ask the user technical questions. Only ask about vision and choices.

## Prerequisites

- `_workspace/project-plan.json` (status: approved)
- `_workspace/execution-state.json`
- If missing: "Please approve the plan first with `/taskforge-plan-approve`"

## Flow

### 1. Identify Target Sprint

If an argument is provided, use that sprint; otherwise, use the next sprint to be executed.
If a context file already exists: "Would you like to continue the previous discussion, or start fresh?"

### 2. Load Existing Decisions

Read context files from previous sprints to understand what has already been decided.
Do not re-ask about things that have already been decided.

### 3. Analyze Gray Areas

Analyze the sprint's tasks to identify gray areas.

**Gray area**: A part of the implementation that can go in multiple directions, where the choice affects the outcome.

Gray area examples (must be specific):
- "Card layout vs. list layout" → decided: card layout
- "Infinite scroll vs. pagination" → mobile: infinite scroll, desktop: pagination
- "Retry on error vs. fail immediately" → retry 3 times on network errors only

**Not gray areas** (do not ask about these):
- Code pattern choices (AI decides)
- Technical risks (research decides)
- Success metrics (emerge naturally from the work)

### 4. Present to the User

```
## Sprint [Name] — Items to Discuss

Please select the items you'd like to discuss (by number, or "all"):

1. 🔲 Card layout vs. list layout
2. 🔲 Empty state display style
3. 🔲 Loading indicator (skeleton vs. spinner)
4. 🔲 AI discretion: button colors, spacing, and other style details

Unselected items will be decided at AI's discretion.
```

### 5. Deep Discussion

Have a thorough conversation about each selected item.
Handle one at a time, and move to the next when a decision feels settled.

### 6. Save Decision Record

Save to `_workspace/contexts/sprint-{id}.md`:

```markdown
---
sprint: m1-s1
status: complete
created: 2026-04-07T...
---

# Sprint m1-s1 — Decision Record

## Locked Decisions

### Layout
- **Card layout** (2 columns, 1 column on mobile)

### Empty state
- Illustration + "No items yet" message

## AI Discretion

- Button colors, spacing, font sizes, and other style details
- Specific skeleton loader shape
```

## Scope Guardrails

**Allowed**: Clarifying "how" to implement something within the sprint scope
**Not allowed**: Adding new features (scope expansion)

If the user proposes a new feature:
> "[Feature X] is a new feature — it would be better to handle it as a separate sprint. Shall we focus on the current sprint for now?"

## After Completion

Guide the user: "Decisions have been recorded. Start execution with `/taskforge-execute`."
