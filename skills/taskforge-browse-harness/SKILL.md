---
name: taskforge-browse-harness
description: Search and browse the catalog of 100 domain harnesses. Use when the user says "/taskforge-browse-harness", "harness list", "find a harness", "what harnesses are there", "domain expert", or similar. Search harnesses by category or keyword.
---

# Browse Harness — Harness Catalog Search

Search 100 domain harnesses by category or keyword.

## Usage

- `/taskforge-browse-harness` — Full category listing
- `/taskforge-browse-harness content` — List harnesses in the content category
- `/taskforge-browse-harness youtube` — Keyword search

## Catalog Source

Read `harnesses/INDEX.md` and display the harness list.

## Display Format

### Category List (no argument)

```
## Harness Catalog (100)

| Category | Count | Description |
|----------|-------|-------------|
| Content | 15 | YouTube, podcasts, newsletters, game narrative, etc. |
| Software | 15 | Full-stack web apps, APIs, mobile, DevOps, etc. |
| Data/ML | 12 | ML experiments, data analysis, NLP, etc. |
| Business | 13 | Startups, market research, pricing strategy, etc. |
| Education | 10 | Language, exams, coding, debate simulators, etc. |
| Legal | 7 | Contracts, patents, GDPR, compliance, etc. |
| Health | 8 | Diet, fitness, taxes, travel, etc. |
| Communication | 8 | Technical docs, proposals, speeches, etc. |
| Operations | 7 | Recruiting, onboarding, process audits, etc. |
| Specialist | 5 | Real estate, e-commerce, urban planning, etc. |

Enter a category name to see the detailed list.
Example: `/taskforge-browse-harness content`
```

### Category Detail (when a category is specified)

```
## Content Harnesses (15)

| Harness | Agents | Description |
|---------|--------|-------------|
| youtube-production | 5 | Video planning, scripting, thumbnails, SEO |
| podcast-studio | 5 | Podcast planning, scripting, editing guide |
| newsletter-engine | 5 | Newsletter planning, writing, distribution |
| ... | ... | ... |

Specify a harness name for detailed information.
- `/taskforge-use-harness youtube-production` — Run directly
- `/taskforge-browse-harness youtube-production` — View details
```

### Harness Detail (when a specific harness is specified)

Read and display the harness's `CLAUDE.md`:
- Agent list and roles
- Skill list
- Workflow (step-by-step)
- Artifact list

## Keyword Search

If the keyword is not a category name, search harness names and descriptions in INDEX.md.
Display matching harnesses as a list; if none found, suggest the closest alternatives.
