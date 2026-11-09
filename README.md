# Build your follow-up tracker with Claude Code

**[Partner] × TenEx · Unlocking Claude Code for non-technical teams · [Date]**

Keep this page open next to Claude Code. Every prompt below has a **copy button** in its top-right corner. Click it, paste into Claude Code, and press Enter.

> **The scenario:** It's Monday. You're back from a week off and 300 emails behind. In the next 45 minutes you'll build an app on your own laptop that shows who's waiting on you and what you promised.

> [!IMPORTANT]
> **Today's rule: read-only.** Claude reads email. It never sends, deletes or moves anything.

> [!TIP]
> **Fallen behind?** Paste this, using the checkpoint the group is on, and Claude will catch you up:
> ```
> catch me up to checkpoint 3
> ```

## Contents

- [Before you start](#before-you-start)
- [1. Get the project](#1-get-the-project) · 5 min
- [2. Customize CLAUDE.md](#2-customize-claudemd) · 7 min
- [3. Find your follow-ups](#3-find-your-follow-ups) · 10 min
- [4. Build the dashboard](#4-build-the-dashboard) · 12 min
- [5. Make it yours](#5-make-it-yours) · 6 min
- [6. Make it repeatable](#6-make-it-repeatable) · 8 min
- [Finished early?](#finished-early)
- [After the session](#after-the-session)
- [Commands worth knowing](#commands-worth-knowing)
- [If something goes wrong](#if-something-goes-wrong)

---

## Before you start

1. **Open Claude Code.** Open the Claude desktop app and go to the **Code** tab. You need a Pro, Max, Team or Enterprise plan.
2. **Open an empty folder.** For example, a new folder called `claude-workshop` on your Desktop.
3. **Run the readiness check** if you haven't yet. It's on the [event page]([pre-page link]). It checks your laptop and asks before installing anything.
4. **Set up your screen:** Claude Code on one side, this page on the other, and the webinar window small. A second monitor helps.

**Email is optional.** Everyone works from the same sample inbox, from a fictional portfolio company. In checkpoint 3 you can switch to your own email if your company allows the Gmail or Outlook connector.

---

## 1. Get the project

`5 min` · **Uses:** Claude running commands for you

*Monday morning. You're back from a week off and 300 emails behind.*

```
clone https://github.com/radhikajoshii/claude-code-workshop directly into this folder, not into a subfolder. Then tell me in plain English what's inside.
```

✅ **Done looks like:** the project's files (`README.md`, `CLAUDE.md`, `data/`) are directly in your workshop folder, and Claude has explained what's in it.

💡 **Notice:** Claude ran Git for you. You didn't need to know the command.

<details>
<summary>The clone failed</summary>

This is usually your company's network. Click the green **Code** button at the top of this page, choose **Download ZIP**, and unzip it. Move the files from the unzipped folder directly into your workshop folder, then paste:

```
I downloaded the workshop project into this folder. Tell me in plain English what's inside.
```
</details>

---

## 2. Customize CLAUDE.md

`7 min` · **Uses:** CLAUDE.md, the project's memory

*Your predecessor left notes for Claude. Read them, then add yours.*

Replace `[your role]` with your actual role, for example "VP of Finance".

```
read CLAUDE.md and tell me the three rules that matter most. Then add a section about me: I'm a [your role] at a PE-backed company.
```

✅ **Done looks like:** `CLAUDE.md` has a new section about you. Open it and read it.

🧪 **Try it:** start a new session in the same folder and ask:

```
what are the rules here?
```

Claude already knows, because it reads CLAUDE.md at the start of every session.

---

## 3. Find your follow-ups

`10 min` · **Uses:** MCP connectors

*Who's waiting on you, and what did you promise? Let Claude find out.*

```
read the sample inbox in data/sample-inbox.json. Find questions I asked that got no reply, and things I promised to do. Save them to data/followups.json.
```

✅ **Done looks like:** `data/followups.json` lists the open items.

<details>
<summary>Now try your own inbox (optional)</summary>

Only if your company allows the Gmail or Outlook connector in Claude.

```
now do the same with my real email from the last 14 days. Save the results to data/followups.json. Don't send anything.
```
</details>

---

## 4. Build the dashboard

`12 min` · **Uses:** plan mode

*Turn that list into something you can check every morning.*

**First, switch to plan mode**, so you approve the plan before anything changes. Then paste:

```
plan a simple local web app that shows data/followups.json as two lists: waiting on others, and my promises.
```

Read the plan. If it looks right, paste:

```
looks good. build it and start it.
```

✅ **Done looks like:** the tracker is open in your browser at a `localhost` address.

💡 **Why plan first:** you approve the plan before any file changes. Fixing a plan is cheap; fixing a finished build isn't.

<details>
<summary>The app isn't showing in my browser</summary>

```
the app isn't showing in my browser. find out why and fix it.
```
</details>

---

## 5. Make it yours

`6 min` · **Uses:** context

*It works. Now make it work the way you do.*

```
add a "mark done" button and sort each list by oldest first
```

Or ask for your own change:

```
group the follow-ups by person
```

```
highlight anything older than a week
```

✅ **Done looks like:** your change shows up in the browser.

🧪 **Try it:** type these one at a time.

```
/context
```

```
/compact
```

`/context` shows how full the session is. `/compact` summarizes it so you can keep going.

---

## 6. Make it repeatable

`8 min` · **Uses:** skills

*You'll want this again tomorrow. Save the steps once.*

```
turn what we did in checkpoint 3 into a skill called refresh-followups, so I can run it any time
```

Then run it:

```
/refresh-followups
```

✅ **Done looks like:** one command updates the dashboard.

💡 **Why a skill:** the web app can't read email by itself. Claude reads the inbox and saves the results, and the app shows them. Running the skill is what keeps the dashboard current.

---

## Finished early?

Try one of these while everyone catches up.

**Schedule it:**

```
run /refresh-followups every weekday morning at 8am
```

**Add your calendar** (if your company allows the calendar connector):

```
connect my calendar and show when I next meet each person on the list
```

**Draft replies** (drafts only; nothing is sent):

```
draft replies to my three oldest follow-ups and show them in the app. Don't send anything.
```

---

## After the session

```
explain how I'd share this project and the refresh-followups skill with a teammate
```

```
what's one other weekly task of mine that would work as a skill like this one?
```

**Your first 30 days:**

| Week | Do this |
|---|---|
| 1 | Pick one workflow you do every week, with inputs you already have |
| 2 | Write a CLAUDE.md for it and turn the steps into a skill |
| 3 | Hand it to a teammate. Fix whatever confuses them |
| 4 | Measure time saved, then pick the next workflow |

---

## Commands worth knowing

| Command | What it does |
|---|---|
| `/init` | Writes a starter CLAUDE.md for a folder |
| `/context` | Shows what's filling the session |
| `/compact` | Summarizes the session and keeps going |
| `/clear` | Starts fresh for a new task |
| `/model` | Switches models |
| `@filename` | Points Claude at a specific file |
| Stop / Esc | Interrupts Claude mid-task so you can steer |

---

## If something goes wrong

| Problem | What to do |
|---|---|
| I'm behind the group | Paste `catch me up to checkpoint N`, using the group's current checkpoint |
| Claude is asking permission to do something | Read what it wants to do. If it makes sense, allow it. If not, say no and tell it what you want instead |
| Claude went off in the wrong direction | Press Stop (or Esc) and tell it what you meant |
| Something errored | Paste: `that didn't work. explain what went wrong in plain English and fix it` |
| The session feels slow or confused | Type `/compact`, or `/clear` and start the step again |
| No email connector | Not a problem. Everything works with the sample inbox |

Still stuck? Post in the chat. TenEx helpers are watching it.

---

## What's in this repo

| File | What it is |
|---|---|
| `README.md` | This guide |
| `CLAUDE.md` | Notes for Claude: the fictional company, the read-only rule, and how to catch you up |
| `data/sample-inbox.json` | Jordan Avery's inbox at Harbor & Pine Supply Co., a fictional company owned by a fictional PE firm. All names and companies are made up |
| `checkpoints/` | Reference copies of the project at the start of each checkpoint, used by "catch me up". You don't need to open these |

You'll create the app itself (`server.js`, `public/`, `data/followups.json`) and the skill during the workshop.

**Questions after today?** [TenEx contact email] · [website]
