---
name: twitter-post
description: Publish approved drafts to X/Twitter using the active runtime's browser automation setup.
---

# Twitter Post Skill

## Purpose
Publish approved drafts to X/Twitter once the founder has explicitly approved them.

## Runtime Notes
- Do not assume a machine-specific browser session path.
- Use the browser automation entrypoint configured for the current runtime.
- If the runtime has not been configured for X/Twitter publishing yet, stop and report the setup gap.

## Steps
1. Load the configured X/Twitter browser session.
2. Open the composer.
3. Paste the approved content or thread.
4. Publish each post in order.
5. Save the post URL or publish result in the active PB-OS project/activity log.

## After Publishing
1. Update the corresponding draft status through Mission Control or the configured draft persistence flow.
2. Record the outcome for Atlas and Pulse.
