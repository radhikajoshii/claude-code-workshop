// Builds the monthly portfolio pack from the files in data/raw/.
// Run it with: node scripts/build-pack.js
// It never changes data/raw/. It writes output/consolidated.csv and output/pack.json.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RAW = path.join(ROOT, "data", "raw");
const OUT = path.join(ROOT, "output");
const VARIANCE_LIMIT = 0.05; // flag anything more than 5% off budget

const COMPANIES = [
  { id: "harbor-pine", name: "Harbor & Pine Supply Co.", match: /harbor/i, parse: parseHarborPine },
  { id: "bluefield", name: "Bluefield Software", match: /bluefield/i, parse: parseBluefield },
  { id: "copperline", name: "Copperline Dental Partners", match: /copperline/i, parse: parseCopperline },
  { id: "tidewater", name: "Tidewater Packaging", match: /tidewater/i, parse: parseTidewater },
];

const flags = [];
function flag(company, month, type, message) {
  flags.push({ company, month, type, message });
}

// --- Reading CSV files -------------------------------------------------------

function parseCsv(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = [];
    let cell = "", quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) { cells.push(cell.trim()); cell = ""; }
      else cell += ch;
    }
    cells.push(cell.trim());
    rows.push(cells);
  }
  return rows;
}
const num = (s) => (s === undefined || s === "" ? null : Number(String(s).replace(/[$,\s]/g, "")));

// --- One reader per company, because every company sends a different format ---

// Harbor & Pine: one row per metric. Use adjusted EBITDA, per CLAUDE.md.
function parseHarborPine(rows, company, month) {
  const byMetric = {};
  for (const [metric, value] of rows.slice(1)) byMetric[metric.toLowerCase()] = num(value);
  if ("ebitda" in byMetric && "ebitda (adjusted)" in byMetric) {
    flag(company, month, "two EBITDA figures",
      `File has both EBITDA (${fmt(byMetric["ebitda"])}) and EBITDA (adjusted) (${fmt(byMetric["ebitda (adjusted)"])}). Used adjusted, per the KPI definitions.`);
  }
  return {
    revenue: byMetric["net sales"],
    gross_profit: byMetric["gross profit"],
    ebitda: byMetric["ebitda (adjusted)"] ?? byMetric["ebitda"],
    cash: byMetric["cash on hand"],
    headcount: byMetric["ftes"],
  };
}

// Bluefield: already tidy, in dollars.
function parseBluefield(rows) {
  const [header, values] = rows;
  const get = (col) => num(values[header.indexOf(col)]);
  return {
    revenue: get("revenue_usd"), gross_profit: get("gross_profit_usd"), ebitda: get("ebitda_usd"),
    cash: get("cash_usd"), headcount: get("headcount"),
  };
}

// Copperline: two title lines before the header, and money in thousands.
function parseCopperline(rows) {
  const headerAt = rows.findIndex((r) => r[0] === "Period");
  const [header, values] = [rows[headerAt], rows[headerAt + 1]];
  const get = (prefix) => num(values[header.findIndex((h) => h.startsWith(prefix))]);
  return {
    revenue: get("Net Revenue") * 1000, gross_profit: get("Gross Profit") * 1000, ebitda: get("Adj. EBITDA") * 1000,
    cash: get("Cash") * 1000, headcount: get("Headcount"),
  };
}

// Tidewater: one row per segment plus a TOTAL row. Add up the segments and
// check them against TOTAL; if they disagree, trust the segments (per CLAUDE.md).
function parseTidewater(rows, company, month) {
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
}

// --- Build the pack ----------------------------------------------------------

function fmt(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
const pct = (a, b) => (b ? (a - b) / b : null);

const budget = {};
for (const [company, month, rev, ebitda] of parseCsv(fs.readFileSync(path.join(ROOT, "data", "budget-2026.csv"), "utf8")).slice(1)) {
  budget[`${company}|${month}`] = { revenue: num(rev), ebitda: num(ebitda) };
}

const months = fs.readdirSync(RAW).filter((m) => /^\d{4}-\d{2}$/.test(m)).sort();
const pack = { generated_at: new Date().toISOString(), months, latest_month: months[months.length - 1], companies: [], flags };

for (const c of COMPANIES) {
  const entry = { id: c.id, name: c.name, months: {} };
  let previous = null;
  for (const month of months) {
    const file = fs.readdirSync(path.join(RAW, month)).find((f) => c.match.test(f) && f.endsWith(".csv"));
    if (!file) {
      flag(c.id, month, "missing file", `No ${month} file from ${c.name}.`);
      entry.months[month] = null;
      continue;
    }
    const k = c.parse(parseCsv(fs.readFileSync(path.join(RAW, month, file), "utf8")), c.id, month);
    const b = budget[`${c.id}|${month}`] || {};
    const row = {
      ...k,
      gross_margin: k.gross_profit / k.revenue,
      ebitda_margin: k.ebitda / k.revenue,
      revenue_budget: b.revenue ?? null,
      ebitda_budget: b.ebitda ?? null,
      revenue_vs_budget: pct(k.revenue, b.revenue),
      ebitda_vs_budget: pct(k.ebitda, b.ebitda),
      source_file: `data/raw/${month}/${file}`,
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
        `Headcount jumped from ${previous.headcount} to ${row.headcount}. Probably a typo; check with the company.`);
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
    lines.push([c.name, month, r.revenue, r.gross_profit, r.gross_margin.toFixed(4), r.ebitda, r.ebitda_margin.toFixed(4), r.cash, r.headcount,
      r.revenue_vs_budget?.toFixed(4) ?? "", r.ebitda_vs_budget?.toFixed(4) ?? "", `"${r.source_file}"`].join(","));
  }
}
fs.writeFileSync(path.join(OUT, "consolidated.csv"), lines.join("\n") + "\n");

// --- Check our work ----------------------------------------------------------

console.log(`Built the pack for ${months.join(", ")}.`);
for (const month of months) {
  const rows = pack.companies.map((c) => c.months[month]).filter(Boolean);
  const total = rows.reduce((a, r) => a + r.revenue, 0);
  console.log(`  ${month}: ${rows.length} of ${COMPANIES.length} companies, portfolio revenue ${fmt(total)}`);
}
console.log(`${flags.length} flags:`);
for (const f of flags) console.log(`  [${f.month}] ${f.company}: ${f.type}. ${f.message}`);
