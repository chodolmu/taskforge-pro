---
name: taskforge-vision
description: Defines the unchanging north star of a project — the Why, core concept, and rough milestone roadmap. Use when the user says "/taskforge-vision", "I want to start a new project", "let's define the vision", "what are we building", or similar. In v2, this replaces the front half of /taskforge-discover. Run this first; then use /taskforge-discover M1 to detail only the current milestone.
---

# Vision — North Star Definition

Lock in the things that should never change: why you're building this, what it fundamentally is, and a loose roadmap of where it's going.

Use plain, everyday language throughout. Never use technical terms without explaining them. Non-developers should feel completely at home here.

## When to Use This vs. /taskforge-discover

- **Small project (single milestone)**: Skip this skill entirely. Start with `/taskforge-discover` — it's faster and all you need.
  If the user seems to have a small, focused idea, say: "This sounds like a single-milestone project — `/taskforge-discover` would be faster and just as effective. Want to go that route?"
- **Larger project (multiple milestones)**: Run `/taskforge-vision` first to lock the big picture, then run `/taskforge-discover M1` to detail only the first milestone.

## What This Skill Locks In

Three things, saved as three files:

| File | What it holds | Can it change? |
|------|---------------|----------------|
| `vision.json` | Why you're building this, constraints, success criteria | Never — this is the north star |
| `concept.json` | What it fundamentally is (genre, core loop, references) | Only after M0 retrospective |
| `roadmap.json` | Loose list of future milestones | Updated every retrospective |

## Flow

### Step 1: Check for Existing Projects

Before asking anything, scan `_workspace/projects/`:

1. If projects already exist, show them:
   ```
   You already have projects:
     1. card-battle-game (started 2026-04-10, 8 of 24 steps done)
     2. shop-ui (finished)

   Options:
   - Start a brand new project
   - Continue an existing one → use /taskforge-status or /taskforge-execute
   ```
2. If the user wants a new project, continue to Step 2.

### Step 2: Capture the Vision (Conversation-First)

Ask questions one at a time, naturally — never as a list. Start with the most important:

**Question set (pick and adapt based on the conversation — do not ask all mechanically):**

1. "What's the core fun or purpose of the game/app you want to make?"
2. "Are there any similar games or apps you love? Names, links, screenshots — all good."
3. "Is there anything you'd absolutely never want to change? Any hard rules or limits?"
4. "How will you know when it's finished? What would make you say 'yes, this is done'?"
5. "Any rough idea of the stages you'd want to build it in? (No worries if not — I can suggest.)"

**Listening for:**
- The core emotion or moment the user wants to create (the "why")
- Hard constraints (budget, platform, must-be-offline, solo-only, etc.)
- Non-goals — things that would bloat the project if added
- Reference works that reveal the taste and ambition level
- A rough sequence of "chapters" for the project

Do not push for technical details here. If the user volunteers them, note them — but don't ask for them.

### Step 3: Capture the Concept

Once the vision is clear, shift to the "what":

- What kind of thing is it? (game genre, app category, tool type)
- What does one "round" or "session" look like from start to finish? (The core loop)
- How long should one session take?
- What platform should it run on? (If the user doesn't know, suggest the simplest option and explain why.)
- Any reference works already mentioned → add to the list

For the tech stack: if the user is comfortable choosing, ask. If not, AI recommends and explains briefly:
- "For a browser game, HTML + JavaScript is the easiest — no installation, runs in any browser."
- "For a mobile app, I'd suggest React Native — one codebase, works on both iPhone and Android."

Mark `lockedAt: null` and `lockedBy: "M0-retro"` — the concept freezes only after the M0 milestone retrospective.

### Step 4: Sketch the Roadmap

Propose a milestone roadmap. Always include **M0 — Prototype** as the first milestone. This milestone exists to answer: "Is the core idea actually fun/useful?" It should be as small as possible and produce something the user can show to another person.

After M0, propose 2–5 additional milestones based on what the user described. Keep them loose — just a name, a one-sentence purpose, and any open questions. These are sketches, not commitments.

**Detail levels:**
- `name-only` — just a name; "we'll figure it out later"
- `sketch` — name + purpose + open questions; no step-by-step plan yet
- `full` — fully broken down into steps; only the currently active milestone reaches this level

The active milestone starts at `sketch`. It becomes `full` only when `/taskforge-discover M1` runs.

Show the proposed roadmap to the user and ask: "Does this feel right? Want to rename, reorder, or add anything?"

### Step 5: Confirm and Save

Show a plain-language summary before saving:

```
Here's what we've locked in:

WHY YOU'RE BUILDING THIS
  "[elevator pitch in one sentence]"
  Why now: [whyNow]

HARD RULES
  - [constraint 1]
  - [constraint 2]

WHAT IT IS
  Type: [genre/category]
  Core experience: [coreLoop]
  One session takes: [targetSession]
  References: [referenceWorks]

HOW YOU'LL KNOW IT'S DONE
  - [successCriteria 1]
  - [successCriteria 2]

ROUGH ROADMAP
  M0 — Prototype: Prove the core idea works. Make something showable.
  M1 — [title]: [purpose]
  M2 — [title]: [purpose]
  ...

Ready to lock this in?
```

If the user confirms, save all three files. If they want changes, update the relevant section and show it again — no need for them to edit files directly.

## Saving the Files

### Project ID

Generate from the project name — lowercase, spaces to hyphens, no special characters.
Example: "Space Tower Defense" → `space-tower-defense`

If a folder with that ID already exists:
```
A project called "space-tower-defense" already exists (started 2026-04-10).
Options:
- Pick a different name
- Start over (warning: this will erase the old project's data)
```

All files go to `_workspace/projects/{projectId}/`.

---

### vision.json

```json
{
  "projectId": "...",
  "projectName": "...",
  "elevator": "One sentence: what this is and why it matters",
  "whyNow": "Why build this now, not later",
  "constraints": ["Hard rule 1", "Hard rule 2"],
  "nonGoals": ["What this project is NOT"],
  "successCriteria": ["How you'll know it's done — criterion 1", "criterion 2"],
  "createdAt": "..."
}
```

---

### concept.json

```json
{
  "projectId": "...",
  "genre": "e.g. tower defense, to-do app, recipe manager",
  "coreLoop": "One sentence: what one full play/use session looks like",
  "targetSession": "e.g. 5–10 minutes",
  "referenceWorks": ["Reference 1", "Reference 2"],
  "techStack": ["HTML5", "JavaScript"],
  "lockedAt": null,
  "lockedBy": "M0-retro"
}
```

`lockedAt` stays `null` until the M0 milestone retrospective confirms the concept is right.

---

### roadmap.json

```json
{
  "projectId": "...",
  "milestones": [
    {
      "id": "M0",
      "title": "Prototype — Prove the Core Idea",
      "purpose": "Get one core loop running. Make something you can show a friend and ask: is this fun?",
      "status": "active",
      "detail": "sketch",
      "confidence": "high",
      "openQuestions": []
    },
    {
      "id": "M1",
      "title": "...",
      "purpose": "...",
      "status": "planned",
      "detail": "name-only",
      "confidence": "medium",
      "openQuestions": ["Open question 1", "Open question 2"]
    }
  ],
  "lastUpdated": "..."
}
```

**`detail` values:**
- `name-only` — name only; planned for the future, nothing more decided
- `sketch` — purpose and open questions defined; no step-by-step plan yet
- `full` — fully broken down; only the currently active milestone reaches this

**`confidence` values:**
- `high` — we know what it is and it's definitely happening
- `medium` — direction is clear, details TBD
- `low` — placeholder; might change or be dropped

---

## After Saving

Guide the user to the next step:

```
Vision locked. Three files saved:
  _workspace/projects/{projectId}/vision.json
  _workspace/projects/{projectId}/concept.json
  _workspace/projects/{projectId}/roadmap.json

Next: use /taskforge-discover M1 to plan the first milestone in detail.
```

## Notes

- Never ask multiple questions at once. Conversation should feel natural.
- If the user is vague or uncertain, that's fine — help them think it through.
- `vision.json` is the one thing that should never change mid-project. If the user wants to change it, flag that it's the north star and confirm they really mean it.
- `concept.json` is frozen only after the M0 milestone is done — until then it can still be adjusted.
- `roadmap.json` is intentionally loose. Future milestones are sketches, not contracts. They get detailed only when they become the active milestone.
- The M0 milestone is always first, always generated automatically, and is always a prototype — do not skip it.
- If the user's idea is clearly a one-milestone project, recommend `/taskforge-discover` instead and explain why it's faster.
