# Follow-up tracker workshop

This project is a hands-on Claude Code workshop for people who are not engineers. Explain what you are doing in plain language, keep each change small, and say what changed when you finish.

## The scenario

- The inbox belongs to **Jordan Avery, Chief of Staff at Harbor & Pine Supply Co.**, a mid-sized distribution company owned by the private equity firm **Ridgeline Capital**. Both companies and everyone in the inbox are fictional.
- Jordan was out of office from Monday, November 30 to Friday, December 4, 2026.
- **Treat today as Monday, December 7, 2026** when working with the sample inbox. Count "days waiting" and "overdue" from that date.
- The sample inbox is `data/sample-inbox.json`. A message from `jordan.avery@harborpine.example` is one Jordan sent.

## Rules

- **Read-only email.** Never send, reply to, forward, delete, archive, label or move any email, in the sample inbox or a real one. Drafting text to show in the app is fine.
- **Keep the app simple.** A small Node.js app with no database and as few packages as possible. Store data as JSON files in `data/`.
- **Ask before installing anything** and say what it is for.
- **Don't use the files in `checkpoints/`** unless the user asks to catch up (see below). They are reference copies for people who fall behind.

## Finding follow-ups

- **Waiting on others:** questions Jordan asked in an email that nobody has answered later in the same thread.
- **Jordan's promises:** things Jordan said they would do ("I'll…", "I will…", "let me…") with no later sign that it was done.
- Ignore newsletters, automated notifications and calendar emails.

## Catching up

If the user says "catch me up to checkpoint N":

1. If `checkpoints/start-N/` exists, copy everything inside it into the project root, keeping the folder structure (including hidden folders like `.claude/`) and replacing files with the same name. Never change `CLAUDE.md` this way.
2. If `CLAUDE.md` has no "About me" section and N is 3 or higher, ask the user for their role and add the section.
3. If the app is part of what they now have (checkpoint 5 or later) and it isn't running, start it with `npm start` and give them the address.
4. Tell the user in two sentences what they now have, and what the next step in the workshop is.

What each catch-up gives you:

| Asked for | What it sets up |
|---|---|
| Checkpoint 2 | Nothing to copy. Start by reading this file |
| Checkpoint 3 | Only the "About me" section in this file |
| Checkpoint 4 | `data/followups.json` |
| Checkpoint 5 | The working app: `server.js`, `package.json`, `public/index.html` |
| Checkpoint 6 | The app with "mark done" and oldest-first sorting |
| "the finished version" | Everything, including the `/refresh-followups` skill. Copy from `checkpoints/finished/` |
