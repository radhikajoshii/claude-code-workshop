# Portfolio pack workshop

This project is a hands-on Claude Code workshop for people who are not engineers. Explain what you are doing in plain language, keep each change small, and say what changed when you finish.

## The scenario

- The user works on the portfolio operations team at **Ridgeline Capital**, a private equity firm. Each month, four portfolio companies send their numbers as files, every one in a different format. The team turns them into one pack for the partners.
- The companies (all fictional):

  | ID | Company | Business |
  |---|---|---|
  | `harbor-pine` | Harbor & Pine Supply Co. | Distribution |
  | `bluefield` | Bluefield Software | Software |
  | `copperline` | Copperline Dental Partners | Dental practices |
  | `tidewater` | Tidewater Packaging | Packaging manufacturing |

- Company files are in `data/raw/<YYYY-MM>/`. The budget is `data/budget-2026.csv`, in US dollars.
- New files land in `incoming/` before they're added to the pack.

## KPI definitions

Use these whenever you read, combine or show the numbers.

- **Revenue:** net revenue (also called net sales) for the month, in US dollars.
- **Gross profit:** revenue minus cost of goods sold. **Gross margin** = gross profit ÷ revenue.
- **EBITDA:** always **adjusted** EBITDA. If a file has both reported and adjusted EBITDA, use adjusted and say so. **EBITDA margin** = EBITDA ÷ revenue.
- **Cash:** cash on hand at month end.
- **Headcount:** full-time employees (FTEs) at month end.
- **Units:** convert everything to whole US dollars. Watch for files reported in thousands ($000s).
- **Totals:** if a file's total row doesn't match the rows it's made of, use the rows and flag the difference.
- **Off budget:** flag revenue or EBITDA that is more than **5%** above or below budget, in either direction.
- **Looks wrong:** flag any number that changes by more than 50% from the previous month without an obvious reason. It's probably a typo.

## Rules

- **Never change or delete anything already in `data/raw/`.** Adding a new month's files is fine. Fix problems in the pipeline, not in the source files.
- **Show your work.** When you combine numbers, check that totals match the source files and say what you checked.
- **Keep it simple.** Use Node.js with no packages if you can, and no database. Write results to `output/`.
- **Ask before installing anything** and say what it's for.
- **Don't use the files in `checkpoints/`** unless the user asks to catch up (see below). They are reference copies for people who fall behind.

## Catching up

If the user says "catch me up to checkpoint N", they want to be ready to *start* checkpoint N with the rest of the group, so set up everything from the earlier checkpoints:

1. If `checkpoints/start-N/` exists, copy everything inside it into the project root, keeping the folder structure (including hidden folders like `.claude/`) and replacing files with the same name. Never change `CLAUDE.md` this way.
2. If `CLAUDE.md` has no "About me" section and N is 3 or higher, ask the user for their role and add the section.
3. If the dashboard is part of what they now have (checkpoint 6 or the finished version) and it isn't running, start it with `npm start` and give them the address.
4. Tell the user in two sentences what they now have, and that they're ready to do checkpoint N (name it: 2 Customize CLAUDE.md, 3 Find what's messy, 4 Build the pipeline, 5 Build the dashboard, 6 Make it repeatable) with the prompt from the README.

| Asked for | What it sets up |
|---|---|
| Checkpoint 2 | Nothing to copy. Start by reading this file |
| Checkpoint 3 or 4 | Only the "About me" section in this file |
| Checkpoint 5 | The pipeline (`scripts/build-pack.js`, `package.json`) and its results in `output/` |
| Checkpoint 6 | Also the dashboard (`server.js`, `public/index.html`) |
| "the finished version" | Everything, including the `/monthly-pack` skill and December's files. Copy from `checkpoints/finished/` |
