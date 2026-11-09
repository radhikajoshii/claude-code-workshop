---
name: build-pack
description: Builds a portfolio pack and dashboard from a folder of company files in one step. Finds what's messy, cleans and combines the files with the KPI definitions in CLAUDE.md, has a numbers-checker subagent check each company against its source, and shows the result in the dashboard. Use when the user runs /build-pack, optionally with a folder such as new-portfolio/ (default data/).
---

# Build a portfolio pack

The folder to use is the one the user named (for example `new-portfolio/`), or `data/` if they didn't name one. It contains `raw/<YYYY-MM>/` with the company files, `budget-2026.csv`, and possibly `companies.csv`.

**Never change or delete anything in the folder's `raw/`.** Fix problems in the pipeline, not in the source files.

1. **Find what's messy.** Read every company file and the budget. List in plain language what's inconsistent: formats, units, missing months, duplicate or contradictory lines, and anything that looks wrong. Don't change any files.
2. **Make sure the pipeline can read every company.** `scripts/pipeline.js` has one reader per company. For any company without a reader, add one that follows the KPI definitions in CLAUDE.md and handles what you found in step 1. Don't change how existing readers behave.
3. **Run the pipeline:** `node scripts/pipeline.js <folder>` (just `node scripts/pipeline.js` for `data/`).
4. **Check each company.** Start one `numbers-checker` subagent per company, in parallel, and give each its company and the folder. If a checker finds a mismatch, fix the reader, rerun the pipeline and check that company again.
5. **Show it.** Make sure the dashboard is running (`npm start`, at http://localhost:3000). The new pack appears as its own tab at the top.
6. **Summarize in plain language:** which companies and months are in the pack, what you fixed or flagged, and the biggest misses against budget first. Say which flags are still open: anything not marked reviewed in `reviews/notes.json`. Never delete that file.
