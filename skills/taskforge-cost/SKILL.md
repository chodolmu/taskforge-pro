---
name: taskforge-cost
description: Displays a per-model cost summary. Use when the user says "/taskforge-cost", "cost", "how much did I spend", "token usage", "how much has this cost", or similar.
---

# Cost — Cost Summary

Summarize costs by model and phase for the project execution, and project remaining costs.

## Prerequisites

- `_workspace/execution-state.json`

## Data Collection

Data recorded on each task execution:
- Model used (haiku/sonnet/opus)
- Execution time
- Token usage (input/output)
- Cost (cost field on each task in execution-state.json)

PM calls (plan, refresh, pivot) and validation (validate, audit) costs are tracked separately.

## Estimating Remaining Cost

Project remaining task costs using per-model average rates:

```
Estimated cost = Σ (average cost per model × remaining tasks per model)

Per-model average cost calculation:
  - Average cost of completed haiku tasks × remaining haiku task count
  - Average cost of completed sonnet tasks × remaining sonnet task count
  - Average cost of completed opus tasks × remaining opus task count

For models with no completed tasks yet, use default estimates:
  - haiku: $0.002/task
  - sonnet: $0.04/task
  - opus: $0.10/task
```

## Output Format

```
Cost Summary — Chrome Dino Game Clone

By model:
  haiku:  3 runs,  $0.003  (1%)   | avg $0.001/task
  sonnet: 8 runs,  $0.32   (78%)  | avg $0.04/task
  opus:   2 runs,  $0.08   (20%)  | avg $0.04/task
  ─────────────────────────
  Total:  13 runs,  $0.403

By phase:
  Milestone 1: $0.35 (12/12 tasks complete)
  Milestone 2: $0.053 (1/8 tasks — in progress)
  Milestone 3: not started

Other:
  PM (planning):  $0.12
  Validation:     $0.05
  ─────────────────────────
  Total cost:      $0.573

Estimated remaining cost:
  haiku  × 5 = ~$0.005
  sonnet × 9 = ~$0.36
  opus   × 2 = ~$0.08
  validation/PM  = ~$0.05
  ─────────────────────────
  Estimated remaining: ~$0.50
  Estimated total:     ~$1.07
```

## When Data Is Unavailable

If execution-state.json has no cost fields:
- "Cost data has not been recorded yet. It will be recorded automatically as tasks are executed."
- Display a partial summary with whatever data is available
