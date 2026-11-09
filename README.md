# Build a portfolio pack with Claude Code

**[Partner] × TenEx · Unlocking Claude Code for non-technical teams · [Date]**

Keep this page open next to Claude Code. Every prompt below has a **copy button** in its top-right corner. Click it, paste into Claude Code, and press Enter.

> **The scenario:** You're on the portfolio operations team at Ridgeline Capital. Four portfolio companies have sent their monthly numbers, and every one uses a different format. In the next hour you'll build a pipeline and a dashboard step by step, turn the whole process into one command, then run that command on companies Claude has never seen.

> [!IMPORTANT]
> **Today's rule:** Claude never changes the companies' original files. It fixes problems in the pipeline, not in the source.

> [!TIP]
> **Fallen behind?** Paste this, using the checkpoint the group is about to start, and Claude will catch you up:
> ```
> catch me up to checkpoint 3
> ```

## Contents

- [Before you start](#before-you-start)
- [1. Get the project](#1-get-the-project) · 7 min
- [2. Find what's messy](#2-find-whats-messy) · 8 min
- [3. Build the pipeline](#3-build-the-pipeline) · 14 min
- [4. Build the dashboard](#4-build-the-dashboard) · 12 min
- [5. Protect the source](#5-protect-the-source) · 4 min
- [6. Turn it into a skill](#6-turn-it-into-a-skill) · 8 min
- [7. One command, new companies](#7-one-command-new-companies) · 5 min
- [After the session](#after-the-session)
- [Commands worth knowing](#commands-worth-knowing)
- [If something goes wrong](#if-something-goes-wrong)

---

## Before you start

1. **Open Claude Code.** Open the Claude desktop app and go to the **Code** tab. You need a Pro, Max, Team or Enterprise plan.
2. **Open an empty folder.** For example, a new folder called `claude-workshop` on your Desktop.
3. **Run the readiness check** if you haven't yet. It's on the [event page]([pre-page link]). It checks your laptop and asks before installing anything.
4. **Set up your screen:** Claude Code on one side, this page on the other, and the webinar window small. A second monitor helps.

Nothing to connect: all the data you need is in this project.

---

## 1. Get the project

`7 min` · **Uses:** Claude running commands for you, CLAUDE.md

*Month-end. The companies' files are in, and the partners want the pack.*

```
clone https://github.com/radhikajoshii/claude-code-workshop directly into this folder, not into a subfolder. Then tell me in plain English what's inside.
```

<details>
<summary>The clone failed</summary>

This is usually your company's network. Open [the project on GitHub](https://github.com/radhikajoshii/claude-code-workshop), click the green **Code** button, choose **Download ZIP**, and unzip it. Move the files from the unzipped folder directly into your workshop folder, then paste:

```
I downloaded the workshop project into this folder. Tell me in plain English what's inside.
```
</details>

**Then meet CLAUDE.md.** Your team already wrote down how it defines each KPI. Replace `[your role]` with your actual role, for example "VP of Finance at a portfolio company", before you press Enter.

```
read CLAUDE.md and explain our KPI definitions in two sentences. Then add a section about me: I'm a [your role].
```

✅ **Done looks like:** the project's files (`README.md`, `CLAUDE.md`, `data/`, `new-portfolio/`) are directly in your workshop folder, and `CLAUDE.md` has a new section about you.

💡 **Why it matters:** Claude ran the commands for you. CLAUDE.md gives every session your team's rules. Try it: start a new session in the same folder and ask `how do we calculate EBITDA here?`

---

## 2. Find what's messy

`8 min` · **Uses:** Claude reading your files

*Before you combine anything, find out what you're dealing with.*

```
look at every file in data/raw and the budget. Before we combine anything, tell me what's inconsistent: formats, units, missing months, and anything that looks wrong. Don't change any files.
```

✅ **Done looks like:** a plain-English list of problems, before anything changes. There are at least five planted in these files. How many did Claude find?

<details>
<summary>Spoiler: what's planted</summary>

- Every company uses a different layout and different names for the same KPIs.
- Copperline reports in thousands of dollars.
- Harbor & Pine's November file has two EBITDA figures.
- Tidewater's October total row doesn't match its segments.
- Tidewater's November file is missing.
- Bluefield's November headcount is 1,520, ten times October's.
</details>

---

## 3. Build the pipeline

`14 min` · **Uses:** plan mode, subagents

*Turn the pile into one clean, checked table.*

**First, switch to plan mode**, so you approve the plan before anything changes. Then paste:

```
plan a script that combines data/raw into one clean table using our KPI definitions, compares it to the budget, flags problems and saves results to output/. Spawn one subagent per company to work out how to clean its file.
```

Read the plan. If it looks right, paste:

```
looks good. build it, run it and check totals against the sources.
```

✅ **Done looks like:** an `output/` folder with the combined results, and Claude tells you what it checked and what it flagged.

💡 **Why it matters:** about one helper per company works in parallel, each dealing with its own company's quirks. Claude decides the split, so three or five helpers is fine. And you approved the plan before anything changed: fixing a plan is cheap, fixing a finished build isn't.

---

## 4. Build the dashboard

`12 min` · **Uses:** Claude building and running an app

*The partners don't read CSV files. Give them something to look at.*

```
build a simple local website that shows the results in output/: a portfolio overview for the latest month and a page for each company. Show anything off budget in red. Let me mark each flag as reviewed and add a note, and save the notes to a file so they're still there after the pipeline reruns. Then start it.
```

✅ **Done looks like:** the dashboard is open in your browser at a `localhost` address, and every flag has a way to mark it reviewed.

🧪 **Try it:** add a note to Bluefield's headcount flag, for example "Called Bluefield, it's 152", and mark it reviewed. Refresh the page: it's still there. Then ask Claude `show me where my note was saved` and open the file. The website wrote it to your own laptop.

<details>
<summary>The dashboard isn't showing in my browser</summary>

```
the dashboard isn't showing in my browser. find out why and fix it.
```
</details>

🧪 **Try it:** type `/context` to see how much of the session's memory you've used. `/compact` summarizes it so you can keep going.

---

## 5. Protect the source

`4 min` · **Uses:** hooks

*The pack is built. Now make "never edit the originals" a rule Claude can't skip.*

```
add a hook that blocks you from changing or deleting the companies' original files in any raw/ folder. Then explain in one sentence what you set up.
```

> [!NOTE]
> Claude will ask permission to edit its settings in the `.claude` folder, where Claude Code keeps its own settings. Click **Allow**.

Then try to break it:

```
test the hook: try to fix Harbor & Pine's November file directly in data/raw/ so we can see it get blocked.
```

✅ **Done looks like:** Claude tries the edit and the hook stops it.

💡 **Why it matters:** CLAUDE.md asks Claude to follow a rule. A hook enforces it, every time.

---

## 6. Turn it into a skill

`8 min` · **Uses:** skills, subagents

*You did it once by hand. Save the whole process as one command.*

```
turn checkpoints 2 to 4 into a skill called build-pack: given a folder of company files, find what's messy, clean and combine them with our KPI definitions, have a subagent check each company against its source, and build the dashboard.
```

> [!NOTE]
> Claude will ask permission to save the skill in the `.claude` folder. Click **Allow**. If `/build-pack` isn't recognized afterwards, start a new session in the same folder.

Then test it:

```
run /build-pack on data/ and compare the result with the dashboard you built.
```

✅ **Done looks like:** the same dashboard, from one command.

💡 **Why it matters:** forty minutes of steps, saved as one command anyone on the team can run.

---

## 7. One command, new companies

`5 min` · **Uses:** the skill you just built

*A new fund's portfolio just landed. Different companies, different formats.*

```
run /build-pack on new-portfolio/ and open the dashboard it builds.
```

✅ **Done looks like:** a new dashboard for companies Claude has never seen, in one step.

💡 **Why it matters:** this is how one person's work becomes the team's process.

<details>
<summary>Spoiler: what's planted in the new portfolio</summary>

- Alder Ridge reports in thousands of dollars, and its November EBITDA is a loss written in brackets: `(36)`.
- Northgate sends gross sales and returns separately, so net revenue has to be worked out, and it has no gross profit line.
- Northgate's November file lists Adjusted EBITDA twice.
- Summit uses semicolons between columns and dots as thousands separators (`1.860.000`).
- Summit's November file says its period is October.
</details>

---

## After the session

```
explain how I'd share this project and the build-pack skill with a teammate
```

```
what's one report I put together every month that would work like this?
```

**Your first 30 days:**

| Week | Do this |
|---|---|
| 1 | Pick one report you build every month from files you already get |
| 2 | Write a CLAUDE.md with your definitions and turn the steps into a skill |
| 3 | Hand it to a teammate. Fix whatever confuses them |
| 4 | Measure time saved, then pick the next report |

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
| I'm behind the group | Paste `catch me up to checkpoint N`, using the checkpoint the group is about to start |
| Claude is asking permission to do something | Read what it wants to do. If it makes sense, allow it. If not, say no and tell it what you want instead |
| Claude went off in the wrong direction | Press Stop (or Esc) and tell it what you meant |
| The hook didn't stop the edit | Paste: `check that the hook in .claude/settings.json runs, and fix it`. CLAUDE.md still tells Claude never to edit the originals, so you can carry on |
| `/build-pack` isn't recognized | Start a new session in the same folder, then try again. New skills are picked up when a session starts |
| A number looks off | Paste: `check [company]'s [month] [KPI] against the source file and explain the difference` |
| Something errored | Paste: `that didn't work. explain what went wrong in plain English and fix it` |
| The session feels slow or confused | Type `/compact`, or `/clear` and start the step again |

Still stuck? Post in the chat. TenEx helpers are watching it.

---

## What's in this repo

| File | What it is |
|---|---|
| `README.md` | This guide |
| `CLAUDE.md` | Notes for Claude: the scenario, the KPI definitions, the rules, and how to catch you up |
| `data/raw/` | October and November files from Ridgeline's four fictional portfolio companies, each in its own format |
| `data/budget-2026.csv` | The monthly budget for each company |
| `new-portfolio/` | Files, a budget and a company list for three more fictional companies, used in step 7 |
| `reviews/` | Created by your dashboard: the flags you've marked reviewed, with your notes |
| `checkpoints/` | Reference copies of the project at each checkpoint, used by "catch me up". You don't need to open these |
| `site/`, `vercel.json` | Build this guide as a web page. You don't need to open these |

You'll create the pipeline, the dashboard, the hook and the skill during the workshop. All companies, people and numbers are fictional.

**Questions after today?** [TenEx contact email] · [website]
