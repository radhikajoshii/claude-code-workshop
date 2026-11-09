---
name: refresh-followups
description: Refresh the follow-up tracker. Scans the inbox for questions Jordan asked that got no reply and promises Jordan made that aren't done, then updates data/followups.json. Use when the user runs /refresh-followups or asks to refresh or update their follow-ups.
---

# Refresh follow-ups

Read-only: never send, reply to, delete or move any email.

1. **Read the inbox.** Use `data/sample-inbox.json` unless the user has asked to use their real email through a connector. For real email, look at the last 14 days.
2. **Find what's waiting on others:** questions the inbox owner asked that nobody answered later in the same thread.
3. **Find the owner's promises:** things they said they would do ("I'll…", "I will…", "let me…") with no later sign they were done.
4. **Skip** newsletters, automated reports and calendar notifications.
5. **Update `data/followups.json`** in the same format it already uses, keeping the `id` of any item that is still open so "mark done" keeps working.
6. **Tell the user what changed** in two or three lines: new items, items that dropped off, and anything overdue.
