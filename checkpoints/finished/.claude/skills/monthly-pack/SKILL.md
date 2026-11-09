---
name: monthly-pack
description: Build the monthly portfolio pack. Moves newly arrived company files from incoming/ into data/raw/, runs the pipeline, checks the totals and summarizes what changed. Use when the user runs /monthly-pack or says new monthly files have arrived.
---

# Monthly portfolio pack

Never change or delete anything that is already in `data/raw/`.

1. **Bring in new files.** If `incoming/` has files, move each one into `data/raw/<month>/` (create the month folder if needed, keep the file name). Tell the user which files you moved.
2. **Run the pipeline:** `npm run pack` (or `node scripts/build-pack.js`).
3. **Check the work.** For each company in the newest month, confirm revenue and EBITDA in `output/pack.json` match the source file, allowing for the unit and format rules in CLAUDE.md. Say so if anything doesn't match.
4. **Summarize in plain language:** which months and companies are now in the pack, anything still missing, and the most important flags (biggest misses against budget first).
5. **Remind the user** to refresh the dashboard at http://localhost:3000. If it isn't running, start it with `npm start`.
