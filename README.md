# TaskForge Pro

**Integrated Project Manager** — TaskForge PM + Harness-100 Domain Experts + GSD Validation Framework, unified in one plugin.

An all-in-one plugin that lets anyone — including non-developers — complete projects easily with Claude Code.

## Features

- **PM Automation** — Automatically breaks projects down into milestones → sprints → tasks
- **100 Domain Expert Teams** — Built-in agent teams for YouTube, web apps, ML, legal, education, and more
- **3-Level Validation** — Goal-backward validation + Interactive UAT + Milestone regression audits
- **Wave Parallel Execution** — Automatically parallelizes tasks with no dependencies
- **Model Optimization** — Automatic model routing by difficulty (haiku/sonnet/opus)
- **Clean Context** — Minimal context per task, connected via Handoff

## GUI (Optional)

A local web UI for visualizing project progress is included in `taskforge-gui/`.

**Requirements**: [Node.js](https://nodejs.org) (v18+)

```
1. git clone https://github.com/chodolmu/taskforge-pro.git
2. taskforge-pro/taskforge-gui/launch.bat 더블클릭
```

`node_modules`가 없으면 첫 실행 시 자동으로 `npm install`합니다.

## Installation

Copy or link to Claude Code's plugin directory:

```bash
# Option 1: Direct copy
cp -r taskforge-pro/ ~/.claude/plugins/taskforge-pro/

# Option 2: Symbolic link
ln -s $(pwd)/taskforge-pro ~/.claude/plugins/taskforge-pro
```

## Quick Start

### Create a Project

```
/taskforge-pro:discover     ← Define the project through conversation
/taskforge-pro:plan          ← AI auto-breaks down the work
/taskforge-pro:plan-approve  ← Approve the plan
/taskforge-pro:execute       ← Execute one task at a time (repeat)
/taskforge-pro:wrap          ← Done!
```

### Use a Harness Directly

```
/taskforge-pro:browse-harness          ← Browse 100-harness catalog
/taskforge-pro:use-harness youtube-production "Plan a video for me"
```

### Quick Task

```
/taskforge-pro:quick Change the button color
```

## Full Workflow

```
/discover → /plan → /plan:approve
    ↓
  [/discuss]  ← Pre-execution discussion (optional)
    ↓
  /execute (repeat) or /execute:all (automatic)
    ↓
  /validate   ← goal-backward validation
    ↓
  [/verify]   ← Interactive UAT (optional)
    ↓
  /refresh → next sprint
    ↓
  [/audit]    ← Milestone validation (optional)
    ↓
  /wrap
```

## Command Reference (26 commands)

### Project Management
| Command | Description |
|---------|-------------|
| `/discover` | Define the project through conversation |
| `/plan` | Break down into milestones/sprints/tasks |
| `/plan:edit` | Edit the plan |
| `/plan:approve` | Approve the plan |
| `/discuss` | Discuss gray areas before execution |

### Execution
| Command | Description |
|---------|-------------|
| `/execute` | Run the next task |
| `/execute:all` | Auto-run the sprint |
| `/quick` | Quick execution without a plan |
| `/handoff` | Generate a work history record |

### Validation
| Command | Description |
|---------|-------------|
| `/validate` | Goal-backward validation |
| `/verify` | Interactive UAT |
| `/audit` | Milestone regression validation |

### Monitoring
| Command | Description |
|---------|-------------|
| `/status` | Progress tree |
| `/cost` | Cost summary |

### Adaptation
| Command | Description |
|---------|-------------|
| `/refresh` | Refresh the plan |
| `/pivot` | Change direction |
| `/retry` | Retry a task |
| `/skip` | Skip a task |

### Harness
| Command | Description |
|---------|-------------|
| `/browse-harness` | 100-harness catalog |
| `/use-harness` | Run a harness directly |

### Other
| Command | Description |
|---------|-------------|
| `/resume` | Resume in a new session |
| `/wrap` | Wrap up the project |
| `/help` | Usage guide |

## Harness Catalog

100 domain expert agent teams are built in:

| Category | Count | Examples |
|----------|-------|---------|
| Content | 15 | YouTube, Podcast, Newsletter, Game Narrative |
| Software | 15 | Full-stack Web App, API Design, Mobile App |
| Data/ML | 12 | ML Experiments, Data Analysis, NLP |
| Business | 13 | Startup Strategy, Market Research, Pricing Strategy |
| Education | 10 | Language Learning, Exam Prep, Coding Education |
| Legal | 7 | Contract Analysis, Patents, GDPR |
| Health | 8 | Diet, Fitness, Tax |
| Communication | 8 | Technical Docs, Proposals, Speeches |
| Operations | 7 | Hiring, Onboarding, Process Audits |
| Specialized | 5 | Real Estate, E-commerce, Urban Planning |

## 3 Core DNAs

| Source | Contribution |
|--------|--------------|
| **TaskForge** | PM Framework — planning, execution, tracking, model routing, Handoff |
| **Harness-100** | Domain Experts — 100 domains, 630 skills, 489 agents |
| **GET SHIT DONE** | Validation Framework — Goal-backward, UAT, regression audits, wave parallelism |

## License

MIT
