---
name: taskforge-use-harness
description: Run a harness directly without the PM pipeline. Use when the user says "/taskforge-use-harness", "run a harness", "use a harness", "run the team", or similar. Use when you want to leverage a domain expert team directly without project management.
---

# Use Harness — Direct Harness Execution

Run a harness directly without the PM pipeline (discover→plan→execute).
Ideal for one-off specialist tasks like "plan a YouTube video" or "analyze this contract."

## Usage

```
/taskforge-use-harness youtube-production "Plan a video for an AI news channel"
/taskforge-use-harness contract-analyzer "Analyze the risks in this contract"
/taskforge-use-harness ml-experiment "Design a recommendation model"
```

If run without arguments:
1. Ask what the user wants to do
2. Recommend an appropriate harness
3. Execute once selected

## Execution Flow

### 1. Load Harness

Read `harnesses/{category}/{harness-name}/CLAUDE.md` to load the orchestrator.

If the harness is not found:
- Search INDEX.md for similar names
- Suggest with: "Did you mean [similar harness]?"

### 2. Collect Input

Identify the information needed for the harness from the user's request.
Gather missing information through conversation (one item at a time).

### 3. Execute the Agent Team

Execute according to the workflow defined by the harness orchestrator:
1. Create the `_workspace/` directory
2. Save input to `_workspace/00_input.md`
3. Execute agents in sequence or in parallel
4. Save each agent's output to `_workspace/`

### 4. Deliver Outputs

After execution completes:
```
✅ Harness execution complete: youtube-production

Outputs:
  _workspace/01_strategist_brief.md   — Content strategy
  _workspace/02_scriptwriter_script.md — Script
  _workspace/03_thumbnail_concept.md   — Thumbnail concept
  _workspace/04_seo_package.md         — SEO metadata
  _workspace/05_review_report.md       — Review report

Let me know if you need any changes.
```

## Auto-Detect Execution Mode

Automatically determine the harness execution mode based on the scope of the user's request:

| Scope | Mode | Example |
|-------|------|---------|
| Full | Full pipeline (5 agents) | "Plan the entire YouTube video" |
| Partial | Reduced mode (2–3 agents) | "Just write the script" |
| Single | Skill only (1 agent) | "Tell me about hook patterns" |

## Reusing Existing Files

If the user has already created files:
- Copy those files to `_workspace/`
- Skip duplicate work and continue from there
- Announce: "I'll use the existing [file]"

## Difference from Project Mode

| | Project Mode | Direct Harness Execution |
|--|--------------|--------------------------|
| Planning | discover→plan→approve | None |
| Tracking | execution-state.json | None |
| Handoff | Links between tasks | None |
| Best for | Complex projects | One-off specialist tasks |
