---
name: taskforge-discover
description: Defines a new project and generates a SpecCard. Use this skill when the user says "create a project", "start a new project", "I want to build something", "/taskforge-discover", or similar. Also triggers when the user has a project idea that hasn't been fully defined yet.
---

# Discover — Project Definition

A skill that defines the project clearly through conversation and generates a SpecCard for subsequent planning.

Use friendly, accessible language so non-developers feel comfortable. Use technical terms only when necessary, and always explain them.

## Flow

### Step 1: Understand the Idea

Start with a single question: "What would you like to build?"

From the user's response, identify:
- What they want to build (project type)
- Why they want to build it (motivation/purpose)
- Who will use it (target users)

Do not ask all questions at once. Gather information naturally, one at a time, through conversation.

### Step 2: Define Core Features

Once the idea is clear, organize the core features.

From what the user describes, distinguish:
- Features that are absolutely necessary (must-have)
- Features that would be nice to have (nice-to-have)

If the user has trouble listing features, suggest examples from similar services/apps: "Would you also need something like this?"

### Step 3: Tech Stack

If the user is a developer, ask about their preferred tech stack.
If the user is a non-developer, AI recommends an appropriate stack with a brief explanation.

Examples:
- "For a browser-based game, HTML + JavaScript is the best fit. No installation needed — runs directly in the browser."
- "For a mobile app, I'd recommend React Native. Build once, run on both iPhone and Android."

### Step 4: Design Decisions

Organize upfront decisions required based on the project's characteristics.

Examples:
- Single-player vs. multiplayer
- Whether it works offline
- Data storage method (local vs. server)
- Whether responsive design is needed

For items the user finds hard to decide, AI recommends and explains the reasoning.

### Step 5: Validation Strategy

Define "how to verify the finished product" based on the tech stack and project type.
If the user has difficulty deciding, AI recommends based on the project type.

Items to define:

1. **Build/compile check** — Command to put the project in a runnable state
2. **Run check** — How to actually run it and verify there are no errors
3. **Quality check** — Code-level validation such as lint, type checking
4. **Functional check** — How to verify that core features actually work

Platform examples:

| Platform | Build | Run check | Quality check | Functional check |
|----------|-------|-----------|---------------|-----------------|
| Web (HTML/JS) | None | Open in browser | eslint | Confirm no console errors |
| Node.js/TS | `npm run build` | `node dist/index.js` | tsc, eslint | Verify API response |
| Unity (C#) | Unity MCP build | Unity play mode | Roslyn analyzer | Scene load + basic behavior |
| Godot (GDScript) | Godot CLI export | Godot --headless run | GDScript lint | Verify scene tree |
| Python | None | `python main.py` | ruff, mypy | Match expected output |
| React/Next.js | `npm run build` | `npm run dev` | tsc, eslint | Verify page rendering |
| Flutter | `flutter build` | `flutter run` | `dart analyze` | Verify widget tree |

The validation strategy includes not just "what commands to run" but also **what must be prepared before validation is possible**.

Example — Unity game project:
```
Validation strategy:
  Prerequisites:
    1. Create Unity project (version: 2022.3 LTS)
    2. Install Unity MCP server and connect to Claude Code
    3. Test MCP connection (ping)
  Build check: Unity MCP → BuildPipeline.BuildPlayer
  Run check: Unity MCP → EditorApplication.EnterPlaymode
  Quality check: Roslyn analyzer warnings = 0
  Functional check: Scene load → play mode → no console errors
```

Example — Godot game:
```
Validation strategy:
  Prerequisites:
    1. Create Godot project (version: 4.x)
    2. Configure Godot MCP server (if available)
    3. If not: use CLI export method
  Build check: godot --headless --export-release
  Run check: godot --headless --run (check error code)
  Quality check: GDScript lint
  Functional check: Manual — provide the user a checklist after running
```

AI recommendation principles:
- **Prerequisites are critical** — If validation tools (MCP, CLI, etc.) are not present, include installation/setup in the plan first
- Only suggest methods that can actually run in the user's environment
- "Cannot automate validation" is a valid answer — convert that item to a manual confirmation checklist
- Automate where possible; ask the user when automation isn't feasible
- Prerequisite items are automatically placed as tasks in `/taskforge-plan`

### Step 6: Confirm and Save

Show the gathered information as a SpecCard summary:

```
Project: [Name]
Type: [Web app / Game / CLI / etc.]
Description: [One or two sentence description]

Core Features:
1. [Feature A]
2. [Feature B]
3. [Feature C]

Tech Stack: [HTML, JavaScript, ...]

Design Decisions:
- [Decision 1]
- [Decision 2]

Validation Strategy:
  Prerequisites: [Environment setup, MCP configuration, etc.]
  Build: [Build command or "none"]
  Run: [How to verify execution]
  Quality: [Lint/type check, etc.]
  Functional: [How to verify core features work]
```

If the user says "looks good" / confirms, save the SpecCard.
If they request changes, update only the relevant parts and show it again.

## SpecCard Storage

Save to `_workspace/spec-card.json` in the project working directory.

```json
{
  "projectName": "Project Name",
  "projectType": "game | webapp | mobile | cli | api | other",
  "description": "One or two sentence project description",
  "targetUser": "Target users",
  "features": [
    { "name": "Feature name", "priority": "must" },
    { "name": "Feature name", "priority": "nice" }
  ],
  "techStack": ["HTML5", "JavaScript", "Canvas API"],
  "designDecisions": [
    "Single-player",
    "Works offline"
  ],
  "validationStrategy": {
    "prerequisites": [
      { "step": "Create Unity project", "type": "setup" },
      { "step": "Install and connect Unity MCP server", "type": "tool" }
    ],
    "build": { "command": "Unity MCP BuildPipeline", "auto": true },
    "run": { "command": "Unity MCP EnterPlaymode", "auto": true },
    "quality": { "command": "Roslyn analyzer", "auto": true },
    "functional": { "method": "Verify no console errors", "auto": false, "checklist": ["Verify scene load", "Verify basic controls"] }
  },
  "createdAt": "2026-04-06T..."
}
```

If the working directory doesn't exist, ask the user for the project folder location.

## Notes

- Do not ask multiple questions at once. Proceed naturally, like a conversation.
- It's fine if the user is vague. Helping them clarify is the role of this skill.
- Do not force non-technical users to choose between technical options. AI makes the judgment and recommends.
- When done, guide them: "You can now use `/taskforge-plan` to create a work plan."
