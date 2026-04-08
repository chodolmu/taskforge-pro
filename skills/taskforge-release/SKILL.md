---
name: taskforge-release
description: Commits all changes, bumps version, pushes, and creates a GitHub release. Use when the user says "/taskforge-release", "release", "push and release", "ship it", or similar.
---

# Release — Commit + Version Bump + Push + GitHub Release

One command to do everything: commit staged changes, bump the patch version, push, tag, and create a GitHub release.

## Flow

### 1. Check for Changes

Run `git status` and `git diff`.
- If no changes: "Nothing to release."
- If changes exist: proceed.

### 2. Commit

- Stage all changed files (be specific — don't blindly `git add -A`)
- Write a concise commit message summarizing the changes
- If there are multiple logical changes, write a multi-line commit message

### 3. Version Bump

Read the current version from `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`.

**Versioning rule**: Increment the patch number (last digit).
- `1.0.1` → `1.0.2`
- `1.0.9` → `1.1.0` (roll over to minor)
- `1.9.9` → `2.0.0` (roll over to major)

Update version in both files:
- `.claude-plugin/plugin.json` → `"version"` field
- `.claude-plugin/marketplace.json` → all `"version"` fields

Commit the version bump separately: `chore: bump version to {new_version}`

### 4. Tag + Push

```
git tag v{new_version}
git push
git push origin v{new_version}
```

### 5. Create GitHub Release

Use `gh release create` with:
- Tag: `v{new_version}`
- Title: `v{new_version}`
- Notes: Auto-generate from the commits since the last tag. Summarize changes in a readable format with sections (e.g., Features, Fixes, Refactors).

### 6. Report

```
✅ Released v{new_version}
   Commits: {count} new commits
   Release: {github_release_url}
```
