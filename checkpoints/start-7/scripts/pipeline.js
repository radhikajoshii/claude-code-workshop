// Builds a month-end pack from a folder of business unit files.
// Run it with: node scripts/pipeline.js            (Ridgeline's business units, in data/)
//          or: node scripts/pipeline.js acquisition
// The folder needs raw/<YYYY-MM>/ with the business units' files and budget-2026.csv.
// It may also have companies.csv (id,company,business); otherwise Ridgeline's four business units are used.
// It never changes the source files. It writes pack.json and consolidated.csv to output/
// (or output/<folder>/ for any folder other than data/), and lists every pack in output/portfolios.json.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FOLDER = process.argv[2] || "data";
const SRC = path.join(ROOT, FOLDER);
const RAW = path.join(SRC, "raw");
const OUT = FOLDER === "data" ? path.join(ROOT, "output") : path.join(ROOT, "output", path.basename(FOLDER));
const VARIANCE_LIMIT = 0.05; // flag anything more than 5% off budget

const RIDGELINE = [
  { id: "harbor-pine", company: "Harbor & Pine Supply Co." },
  { id: "bluefield", company: "Bluefield Software" },
  { id: "copperline", company: "Copperline Dental Partners" },
  { id: "tidewater", company: "Tidewater Packaging" },
];

const flags = [];
function flag(company, month, type, message) {
  flags.push({ company, month, type, message });
}

// --- Reading CSV files -------------------------------------------------------

function parseCsv(text, delimiter = ",") {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = [];
    let cell = "", quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === delimiter && !quoted) { cells.push(cell.trim()); cell = ""; }
      else cell += ch;
    }
    cells.push(cell.trim());
    rows.push(cells);
  }
  return rows;
}
// "1,234" -> 1234, "$5" -> 5, "(36)" -> -36 (accountants write losses in brackets)
function num(s) {
  if (s === undefined || s === null || s === "") return null;
  let t = String(s).replace(/[$,\s]/g, "");
  const negative = /^\(.*\)$/.test(t);
  if (negative) t = t.slice(1, -1);
  const n = Number(t);
  return negative ? -n : n;
}

// --- One reader per business unit, because every unit sends a different format ---
// Each reader gets the raw text and returns revenue, gross_profit, ebitda, cash and headcount in whole dollars.

const READERS = {
  // Harbor & Pine: one row per metric. Use adjusted EBITDA, per CLAUDE.md.
  "harbor-pine": { match: /harbor/i, read(text, company, month) {
    const byMetric = {};
    for (const [metric, value] of parseCsv(text).slice(1)) byMetric[metric.toLowerCase()] = num(value);
    if ("ebitda" in byMetric && "ebitda (adjusted)" in byMetric) {
      flag(company, month, "two EBITDA figures",
        `File has both EBITDA (${fmt(byMetric["ebitda"])}) and EBITDA (adjusted) (${fmt(byMetric["ebitda (adjusted)"])}). Used adjusted, per the KPI definitions.`);
    }
    return {
      revenue: byMetric["net sales"], gross_profit: byMetric["gross profit"],
      ebitda: byMetric["ebitda (adjusted)"] ?? byMetric["ebitda"],
      cash: byMetric["cash on hand"], headcount: byMetric["ftes"],
    };
  } },

  // Bluefield: already tidy, in dollars.
  bluefield: { match: /bluefield/i, read(text) {
    const [header, values] = parseCsv(text);
    const get = (col) => num(values[header.indexOf(col)]);
    return {
      revenue: get("revenue_usd"), gross_profit: get("gross_profit_usd"), ebitda: get("ebitda_usd"),
      cash: get("cash_usd"), headcount: get("headcount"),
    };
  } },

  // Copperline: two title lines before the header, and money in thousands.
  copperline: { match: /copperline/i, read(text) {
    const rows = parseCsv(text);
    const headerAt = rows.findIndex((r) => r[0] === "Period");
    const [header, values] = [rows[headerAt], rows[headerAt + 1]];
    const get = (prefix) => num(values[header.findIndex((h) => h.startsWith(prefix))]);
    return {
      revenue: get("Net Revenue") * 1000, gross_profit: get("Gross Profit") * 1000, ebitda: get("Adj. EBITDA") * 1000,
      cash: get("Cash") * 1000, headcount: get("Headcount"),
    };
  } },

  // Tidewater: one row per segment plus a TOTAL row. Add up the segments and
  // check them against TOTAL; if they disagree, trust the segments (per CLAUDE.md).
  tidewater: { match: /tidewater/i, read(text, company, month) {
    const rows = parseCsv(text);
    const header = rows[0];
    const col = (name) => header.indexOf(name);
    const segments = rows.slice(1).filter((r) => r[0].toUpperCase() !== "TOTAL");
    const total = rows.find((r) => r[0].toUpperCase() === "TOTAL");
    const sum = (name) => segments.reduce((acc, r) => acc + num(r[col(name)]), 0);
    const result = {
      revenue: sum("Revenue"), gross_profit: sum("Gross Profit"), ebitda: sum("EBITDA"),
      cash: num(total[col("Cash")]), headcount: num(total[col("Headcount")]),
    };
    for (const [name, key] of [["Revenue", "revenue"], ["Gross Profit", "gross_profit"], ["EBITDA", "ebitda"]]) {
      const stated = num(total[col(name)]);
      if (stated !== result[key]) {
        flag(company, month, "total doesn't add up",
          `${name} TOTAL row says ${fmt(stated)} but the segments add up to ${fmt(result[key])}. Used the segments.`);
      }
    }
    return result;
  } },
};

// --- Build the pack ----------------------------------------------------------

function fmt(n) { return (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US"); }
const pct = (a, b) => (b ? (a - b) / b : null);

const companiesFile = path.join(SRC, "companies.csv");
const COMPANIES = fs.existsSync(companiesFile)
  ? parseCsv(fs.readFileSync(companiesFile, "utf8")).slice(1).map(([id, company]) => ({ id, company }))
  : RIDGELINE;

const budget = {};
for (const [company, month, rev, ebitda] of parseCsv(fs.readFileSync(path.join(SRC, "budget-2026.csv"), "utf8")).slice(1)) {
  budget[`${company}|${month}`] = { revenue: num(rev), ebitda: num(ebitda) };
}

const months = fs.readdirSync(RAW).filter((m) => /^\d{4}-\d{2}$/.test(m)).sort();
const pack = { portfolio: FOLDER, generated_at: new Date().toISOString(), months, latest_month: months[months.length - 1], companies: [], flags };

for (const c of COMPANIES) {
  const reader = READERS[c.id];
  const entry = { id: c.id, name: c.company, months: {} };
  let previous = null;
  for (const month of months) {
    const file = reader && fs.readdirSync(path.join(RAW, month)).find((f) => reader.match.test(f) && f.endsWith(".csv"));
    if (!reader) {
      flag(c.id, month, "no reader yet", `There's no reader for ${c.company}'s format yet. Add one to scripts/pipeline.js.`);
      entry.months[month] = null;
      continue;
    }
    if (!file) {
      flag(c.id, month, "missing file", `No ${month} file from ${c.company}.`);
      entry.months[month] = null;
      continue;
    }
    const k = reader.read(fs.readFileSync(path.join(RAW, month, file), "utf8"), c.id, month);
    const b = budget[`${c.id}|${month}`] || {};
    const row = {
      ...k,
      gross_margin: k.gross_profit / k.revenue,
      ebitda_margin: k.ebitda / k.revenue,
      revenue_budget: b.revenue ?? null,
      ebitda_budget: b.ebitda ?? null,
      revenue_vs_budget: pct(k.revenue, b.revenue),
      ebitda_vs_budget: pct(k.ebitda, b.ebitda),
      source_file: `${FOLDER}/raw/${month}/${file}`,
    };
    for (const [label, key] of [["Revenue", "revenue_vs_budget"], ["EBITDA", "ebitda_vs_budget"]]) {
      if (row[key] !== null && Math.abs(row[key]) > VARIANCE_LIMIT) {
        flag(c.id, month, "off budget", `${label} ${row[key] > 0 ? "+" : ""}${(row[key] * 100).toFixed(1)}% vs budget.`);
      }
    }
    // Compare headcount with the last month that looked right, so one typo is flagged once.
    let looksWrong = false;
    if (previous && previous.headcount && Math.abs(row.headcount / previous.headcount - 1) > 0.5) {
      looksWrong = true;
      flag(c.id, month, "looks wrong",
        `Headcount jumped from ${previous.headcount} to ${row.headcount}. Probably a typo; check with the business unit.`);
    }
    entry.months[month] = row;
    if (!looksWrong) previous = row;
  }
  pack.companies.push(entry);
}

// --- Write the outputs -------------------------------------------------------

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "pack.json"), JSON.stringify(pack, null, 2));

const cols = ["company", "month", "revenue", "gross_profit", "gross_margin", "ebitda", "ebitda_margin", "cash", "headcount", "revenue_vs_budget", "ebitda_vs_budget", "source_file"];
const lines = [cols.join(",")];
for (const c of pack.companies) {
  for (const [month, r] of Object.entries(c.months)) {
    if (!r) continue;
    lines.push([`"${c.name}"`, month, r.revenue, r.gross_profit, r.gross_margin.toFixed(4), r.ebitda, r.ebitda_margin.toFixed(4), r.cash, r.headcount,
      r.revenue_vs_budget?.toFixed(4) ?? "", r.ebitda_vs_budget?.toFixed(4) ?? "", `"${r.source_file}"`].join(","));
  }
}
fs.writeFileSync(path.join(OUT, "consolidated.csv"), lines.join("\n") + "\n");

// List every pack built so far, so the dashboard can switch between them.
const indexFile = path.join(ROOT, "output", "portfolios.json");
const index = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, "utf8")) : [];
const packPath = path.relative(ROOT, path.join(OUT, "pack.json")).split(path.sep).join("/");
const label = FOLDER === "data" ? "Ridgeline Group" : path.basename(FOLDER).replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
const kept = index.filter((p) => p.path !== packPath);
kept.push({ id: path.basename(FOLDER), label, path: packPath });
fs.writeFileSync(indexFile, JSON.stringify(kept, null, 2));

// --- Check our work ----------------------------------------------------------

console.log(`Built the ${label} pack for ${months.join(", ")} (${path.relative(ROOT, OUT) || "."}/).`);
for (const month of months) {
  const rows = pack.companies.map((c) => c.months[month]).filter(Boolean);
  const total = rows.reduce((a, r) => a + r.revenue, 0);
  console.log(`  ${month}: ${rows.length} of ${COMPANIES.length} business units, total revenue ${fmt(total)}`);
}
console.log(`${flags.length} flags:`);
for (const f of flags) console.log(`  [${f.month}] ${f.company}: ${f.type}. ${f.message}`);
