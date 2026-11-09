# Build a portfolio pack with Claude Code

**[Partner] × TenEx · Unlocking Claude Code for non-technical teams · [Date]**

Keep this page open next to Claude Code. Every prompt below has a **copy button** in its top-right corner. Click it, paste into Claude Code, and press Enter.

> **The scenario:** You're on the portfolio operations team at Ridgeline Capital. Four portfolio companies have sent their monthly numbers, and every one uses a different format. In the next 45 minutes you'll build something that turns that pile into one pack and a dashboard, then run it again for next month with one command.

> [!IMPORTANT]
> **Today's rule:** Claude never changes the companies' original files. It fixes problems in the pipeline, not in the source.

> [!TIP]
> **Fallen behind?** Paste this, using the checkpoint the group is about to start, and Claude will catch you up:
> ```
> catch me up to checkpoint 4
> ```

## Contents

- [Before you start](#before-you-start)
- [1. Get the project](#1-get-the-project) · 5 min
- [2. Customize CLAUDE.md](#2-customize-claudemd) · 6 min
- [3. Find what's messy](#3-find-whats-messy) · 8 min
- [4. Build the pipeline](#4-build-the-pipeline) · 12 min
- [5. Build the dashboard](#5-build-the-dashboard) · 10 min
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

Nothing to connect: all the data you need is in this project.

---

## 1. Get the project

`5 min` · **Uses:** Claude running commands for you

*Month-end. The portfolio companies' files are in, and the partners want the pack.*

```
clone https://github.com/radhikajoshii/claude-code-workshop directly into this folder, not into a subfolder. Then tell me in plain English what's inside.
```

✅ **Done looks like:** the project's files (`README.md`, `CLAUDE.md`, `data/`, `incoming/`) are directly in your workshop folder, and Claude has explained what's in it.

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

`6 min` · **Uses:** CLAUDE.md, the project's memory

*Your team already wrote down how it defines each KPI. Read it, then add yourself.*

Replace `[your role]` with your actual role, for example "VP of Finance at a portfolio company".

```
read CLAUDE.md and explain our KPI definitions in two sentences. Then add a section about me: I'm a [your role].
```

✅ **Done looks like:** `CLAUDE.md` has a new section about you. Open it and read it.

🧪 **Try it:** start a new session in the same folder and ask:

```
how do we calculate EBITDA here?
```

Claude already knows, because it reads CLAUDE.md at the start of every session.

---

## 3. Find what's messy

`8 min` · **Uses:** Claude reading your files

*Before you combine anything, find out what you're dealing with.*

```
look at every file in data/raw and the budget. Before we combine anything, tell me what's inconsistent: formats, units, missing months, and anything that looks wrong. Don't change any files.
```

✅ **Done looks like:** a plain-English list of problems. There are at least five planted in these files. How many did Claude find?

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

## 4. Build the pipeline

`12 min` · **Uses:** plan mode

*Turn the pile into one clean, checked table.*

**First, switch to plan mode**, so you approve the plan before anything changes. Then paste:

```
plan a script that combines data/raw into one clean table using our KPI definitions, compares it to the budget, flags problems, and saves results to output/.
```

Read the plan. If it looks right, paste:

```
looks good. build it, run it and check totals against the sources.
```

✅ **Done looks like:** an `output/` folder with the combined results, and Claude tells you what it checked and what it flagged.

💡 **Why plan first:** you approve the plan before any file changes. Fixing a plan is cheap; fixing a finished build isn't.

---

## 5. Build the dashboard

`10 min` · **Uses:** Claude building and running an app

*The partners don't read CSV files. Give them something to look at.*

```
build a simple local website that shows the results in output/: a portfolio overview for the latest month and a page for each company. Show anything off budget in red. Then start it.
```

✅ **Done looks like:** the dashboard is open in your browser at a `localhost` address.

<details>
<summary>The dashboard isn't showing in my browser</summary>

```
the dashboard isn't showing in my browser. find out why and fix it.
```
</details>

🧪 **Try it:** type `/context` to see how much of the session's memory you've used. `/compact` summarizes it so you can keep going.

---

## 6. Make it repeatable

`8 min` · **Uses:** skills

*Next month you'll do this again. Save the steps once.*

```
turn checkpoint 4 into a skill called monthly-pack: move new files from incoming/ into data/raw/, run the pipeline, check totals, summarize what changed.
```

Then December arrives:

```
December's files just arrived in incoming/. Run /monthly-pack.
```

✅ **Done looks like:** refresh the dashboard and it shows December. Tidewater's late November file is filled in too.

💡 **Why this matters:** the next pack is one command, and it runs the same way every month. That's the difference between asking an AI and building something your team can rely on.

---

## Finished early?

Try one of these while everyone catches up.

**Write the partner memo:**

```
write a one-page memo for the partners on December's results. Save it in output/.
```

**Get a second opinion** (uses a subagent):

```
use a subagent to check every December number in output/ against the source files
```

**Add a chart:**

```
add a chart to the overview showing each company's EBITDA margin by month
```

**Protect the source files** (uses a hook):

```
add a hook so Claude can never edit or delete anything in data/raw/
```

---

## After the session

```
explain how I'd share this project and the monthly-pack skill with a teammate
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
| `data/raw/` | October and November files from four fictional portfolio companies, each in its own format |
| `data/budget-2026.csv` | The monthly budget for each company |
| `incoming/` | Files that arrive later: Tidewater's late November file and everyone's December numbers |
| `checkpoints/` | Reference copies of the project at each checkpoint, used by "catch me up". You don't need to open these |

You'll create the pipeline, the dashboard and the skill during the workshop. All companies, people and numbers are fictional.

**Questions after today?** [TenEx contact email] · [website]
