---
name: taskforge-retry
description: Retries a failed task. Use when the user says "/taskforge-retry", "retry", "try again", or similar. Adds the failure reason to the handoff and re-executes in a fresh context.
---

# Retry — Task Retry

Retry a failed task. Include the previous failure reason in the context to avoid repeating the same mistake.

## Behavior

1. Identify the target task:
   - `/taskforge-retry` → the most recently failed task
   - `/taskforge-retry m1-s2-t3` → a specific task

2. Load the failure reason from the handoff

3. Add the failure reason to the context:
   ```
   Reason this task failed on the previous attempt:
   - [Build error: Cannot find module 'xxx']
   - [Previous approach and why it failed]
   
   Avoid the above issues this time.
   ```

4. Re-execute using the same flow as `/taskforge-execute`

5. Increment retry_count. If failed 2 times in a row:
   ```
   ⚠️ This task has failed 2 times in a row.
   
   Failure reason: [summary]
   
   Options:
   - `/taskforge-retry` — Try once more (with a different approach)
   - `/taskforge-skip` — Skip this task and move on
   - Fix it yourself, then run `/taskforge-handoff` — User manually fixes the code
   ```
