---
name: taskforge-quick
description: Runs a quick single task without a plan. Use when the user says "/taskforge-quick", "fix this", "change this", "tweak", "just do it", or similar. v2 adds size gate (confirms this is actually tiny), reference check, and telemetry. Skips discover→plan for small edits, bug fixes, single-file work.
---

# Quick — Quick Execution (v2)

Execute a task immediately without going through discover→plan.

**v2 key changes**:
1. **Size gate**: Actively confirm the request is truly tiny. If not → route to the right place.
2. **Reference check**: If project has `references/`, check if any are relevant.
3. **Conventions**: Always read before making changes.
4. **Telemetry**: Log to `telemetry.jsonl`.
5. **No handoff**: Quick tasks don't generate handoff files (they're too small).

## Size Gate (v2 — first thing to do)

Before doing anything, classify the request:

| Size | Signals | Route |
|------|---------|-------|
| **tiny** | One file, CSS tweak, config change, copy fix, single function | ✅ Proceed with quick |
| **normal** | Bug fix across 2-3 files, small feature addition | ✅ Proceed with quick (note the scope) |
| **feature** | New component, multiple files, needs design decision | 🔀 Suggest `/taskforge-discover` |
| **milestone** | New major feature, architectural change | 🔀 Suggest `/taskforge-vision` or `/taskforge-discover` |

If **feature** or larger: say so and offer to route.
```
이건 작은 수정보다 조금 큰 작업 같아요.
/taskforge-discover로 제대로 정의하고 진행하는 게 더 나을 것 같아요.
그냥 빠르게 진행하고 싶으면 말해줘요.
```

## When to Use

✅ Good for quick:
- Single file modifications
- Simple bug fixes
- Style/CSS changes
- Config file edits
- Copy/text changes
- Adding a small utility function

❌ Not for quick (suggest better route):
- Changes spanning many files
- Work requiring architecture decisions
- Features needing multiple steps
- Anything that needs a plan

## Execution Flow

### 1. Size Gate
Classify request (see above). Confirm proceed if tiny/normal.

### 2. Load Conventions
If a project is active, read `conventions.md` before making changes.
If multiple projects: check which is relevant to the request.
Follow established patterns — colors, naming, file structure.

### 3. Reference Check (v2)
If project has `references/` directory, quickly scan:
- Is there a reference file relevant to this change?
- If yes: include it in context (silently — don't tell user "I'm doing few-shot")
- If no: proceed without references

### 4. Determine if a Skill Is Needed
If domain expertise would help, auto-load relevant skill from `harnesses/`.
- Security fix → inject `api-security-checklist`
- Game balance → inject relevant game skill
- Don't mention "skill injection" to user

### 5. Execute
- Clean context
- Apply changes following conventions
- Run automated validation (build, lint per spec-card if available)

### 6. Silent Error Check (v2)
Quick-scan changed files for obvious issues:
- `TODO` / `FIXME` left behind
- Debug `console.log` added
- Hardcoded secrets

If found: fix or report. Don't mark done if obvious issues exist.

### 7. Telemetry (v2)
```json
{"t":"...","event":"quick_task","description":"CSS 버튼 색 변경","size":"tiny","outcome":"pass","tokens":450,"costUSD":0.001,"wallMin":0.5,"filesChanged":["src/components/Button.css"]}
```
- `size`: classification from the size gate (`"tiny"` or `"normal"`). If classified as `"feature"` or `"milestone"`, quick should have routed to discover/plan instead — but if the user overrode the suggestion, log with the original classification so routing accuracy can be measured (validation-plan S2).

### 8. Report Result

```
✅ 완료: "로그인 버튼 색 변경" (빠름, 30초, $0.001)
   변경: src/components/LoginButton.css
   검증: 린트 ✅
```

## Notes

- Quick does not generate a handoff or changelog
- If a project is in progress, quick reads conventions but does not modify project state
- If the user tries to use Quick for large work: "이건 /taskforge-discover로 시작하는 게 더 나아요" (but don't force — user can override)
- Telemetry is logged even for tiny tasks (useful for measuring quick vs plan task ratio)
