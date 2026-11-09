// Builds the workshop guide web page from README.md, so the README stays the one place prompts are edited.
// Step minutes in the README are left out of the page; they are for the facilitator.
// Run it with: node site/build.js   (writes site/dist/index.html; Vercel runs this on every deploy)
// No packages: it understands the Markdown the README uses (headings, paragraphs, lists, tables,
// code blocks, quotes, GitHub alerts and <details>), nothing more.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "dist");
const REPO_URL = "https://github.com/radhikajoshii/claude-code-workshop";
const md = fs.readFileSync(path.join(ROOT, "README.md"), "utf8").replace(/\r\n/g, "\n");

const warnings = [];

// --- Inline Markdown ---------------------------------------------------------

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = esc(s);
  // [text](url). A url that is itself a [placeholder] means the link hasn't been filled in yet.
  s = s.replace(/\[([^\]]+)\]\((\[[^\]]*\]|[^)\s]+)\)/g, (_, label, url) => {
    if (url.startsWith("[")) { warnings.push(`link "${label}" points at ${url}`); return label; }
    const external = /^https?:/.test(url);
    return `<a href="${url}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  for (const m of s.match(/\[[^\]!]+\]/g) || []) warnings.push(`placeholder ${m}`);
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}

// --- Block Markdown ----------------------------------------------------------

const ALERTS = { NOTE: "Note", TIP: "Tip", IMPORTANT: "Important", WARNING: "Warning", CAUTION: "Caution" };
const isBlockStart = (l) => /^(```|#{1,6}\s|>|<details>|---\s*$|\|)/.test(l) || /^\s*([-*]|\d+\.)\s+/.test(l);

function codeBlock(code) {
  return `<div class="code"><button class="copy" type="button" aria-label="Copy this prompt">Copy</button><pre><code>${esc(code)}</code></pre></div>`;
}

function blocks(lines) {
  let html = "";
  for (let i = 0; i < lines.length; ) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("```")) {
      const body = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) body.push(lines[i]);
      i++;
      html += codeBlock(body.join("\n"));
      continue;
    }

    if (line.trim() === "<details>") {
      let depth = 1; const body = [];
      for (i++; i < lines.length; i++) {
        if (lines[i].trim() === "<details>") depth++;
        if (lines[i].trim() === "</details>" && --depth === 0) break;
        body.push(lines[i]);
      }
      i++;
      const summaryAt = body.findIndex((l) => /<summary>/.test(l));
      const summary = summaryAt >= 0 ? body[summaryAt].replace(/<\/?summary>/g, "").trim() : "More";
      html += `<details><summary>${inline(summary)}</summary><div class="details-body">${blocks(body.slice(summaryAt + 1))}</div></details>`;
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { html += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`; i++; continue; }

    if (/^---\s*$/.test(line)) { i++; continue; } // sections already have their own dividers

    if (line.startsWith(">")) {
      const body = [];
      for (; i < lines.length && lines[i].startsWith(">"); i++) body.push(lines[i].replace(/^> ?/, ""));
      const alert = body[0].match(/^\[!(\w+)\]\s*$/);
      if (alert && ALERTS[alert[1]]) {
        const kind = alert[1].toLowerCase();
        html += `<div class="alert ${kind}"><p class="alert-title">${ALERTS[alert[1]]}</p>${blocks(body.slice(1))}</div>`;
      } else {
        html += `<blockquote>${blocks(body)}</blockquote>`;
      }
      continue;
    }

    if (line.startsWith("|") && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || "")) {
      const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line); const rows = [];
      for (i += 2; i < lines.length && lines[i].startsWith("|"); i++) rows.push(cells(lines[i]));
      html += `<div class="table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${
        rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      continue;
    }

    const li = line.match(/^\s*([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const ordered = /\d/.test(li[1]); const items = [];
      for (; i < lines.length; i++) {
        const m = lines[i].match(/^\s*([-*]|\d+\.)\s+(.*)$/);
        if (m) items.push(m[2]);
        else if (lines[i].trim() && !isBlockStart(lines[i]) && items.length) items[items.length - 1] += " " + lines[i].trim();
        else break;
      }
      const tag = ordered ? "ol" : "ul";
      html += `<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${tag}>`;
      continue;
    }

    const para = [];
    for (; i < lines.length && lines[i].trim() && !(para.length && isBlockStart(lines[i])); i++) para.push(lines[i].trim());
    const text = para.join(" ");
    const kind = text.startsWith("✅") ? "done" : text.startsWith("💡") ? "why" : text.startsWith("🧪") ? "try"
      : /^`\d+ min`/.test(text) ? "meta" : "";
    html += kind === "meta"
      // The page leaves out each step's minutes (they're for the facilitator) and keeps what the step uses.
      ? `<p class="meta">${inline(text).replace(/^<code>\d+ min<\/code>\s*·?\s*/, "")}</p>`
      : `<p${kind ? ` class="callout ${kind}"` : ""}>${inline(text)}</p>`;
  }
  return html;
}

// --- Split the README into sections -------------------------------------------

const slug = (t) => t.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
const lines = md.split("\n");
const title = (lines.find((l) => l.startsWith("# ")) || "# Workshop").slice(2).trim();
const sections = [];
let intro = [];
for (const line of lines) {
  if (line.startsWith("# ")) continue;
  const h2 = line.match(/^## (.*)$/);
  if (h2) sections.push({ title: h2[1].trim(), lines: [] });
  else if (sections.length) sections[sections.length - 1].lines.push(line);
  else intro.push(line);
}
// The first bold line under the title is the event line ("Partner × TenEx · ... · Date").
const eventAt = intro.findIndex((l) => /^\*\*.*\*\*$/.test(l.trim()));
const eventLine = eventAt >= 0 ? intro.splice(eventAt, 1)[0].trim().replace(/^\*\*|\*\*$/g, "") : "";

const shown = sections.filter((s) => s.title !== "Contents"); // the sidebar replaces the contents list
const nav = shown.map((s) => ({ id: slug(s.title), title: s.title, step: /^\d+\./.test(s.title) }));

const body = shown.map((s, n) => {
  const { id, step } = nav[n];
  const done = step ? `<button class="done-toggle" type="button" data-step="${id}" aria-pressed="false">Mark step done</button>` : "";
  return `<section id="${id}" class="${step ? "step" : "extra"}"><div class="section-head"><h2>${inline(s.title)}</h2>${done}</div>${blocks(s.lines)}</section>`;
}).join("\n");

const navHtml = nav.map((s) => `<li><a href="#${s.id}" data-id="${s.id}"${s.step ? ' class="is-step"' : ""}><span class="nav-title">${inline(s.title)}</span></a></li>`).join("");

// --- The page -----------------------------------------------------------------

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="Step-by-step guide for the hands-on Claude Code workshop. Every prompt has a copy button.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2316202e'/%3E%3Cpath d='M9 16.5l4.5 4.5L23 11.5' stroke='%23f0a27e' stroke-width='3.2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #f7f5f0; --card: #fdfcf9; --ink: #16202e; --muted: #4a5568; --line: #ddd7cb; --soft: #ece8df;
  --accent: #9e4220; --accent-soft: #f6e6dd; --navy: #16202e; --code-ink: #f1ede4;
  --tip: #2f6b4f; --tip-soft: #e3efe7; --note: #2f5a8a; --note-soft: #e4ecf5;
  --sans: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  --display: "Space Grotesk", Inter, system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 24px; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 17px/1.6 var(--sans); -webkit-font-smoothing: antialiased; }
a { color: var(--accent); text-underline-offset: 3px; }
code { font-family: var(--mono); font-size: 0.86em; background: var(--soft); padding: 0.1em 0.35em; border-radius: 5px; }
.layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); max-width: 1240px; margin: 0 auto; }

/* Sidebar */
aside.nav { position: sticky; top: 0; height: 100vh; overflow-y: auto; padding: 32px 20px 32px 28px; border-right: 1px solid var(--line); }
.brand { font: 600 13px/1.3 var(--sans); letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); margin: 0 0 6px; }
.nav h2 { font: 600 20px/1.25 var(--display); margin: 0 0 20px; }
.nav ol { list-style: none; margin: 0; padding: 0; }
.nav a { display: flex; justify-content: space-between; gap: 10px; padding: 8px 12px; border-radius: 8px; color: var(--ink); text-decoration: none; font-size: 15px; line-height: 1.35; }
.nav a:hover { background: var(--soft); }
.nav a.active { background: var(--navy); color: #fff; }
.nav a.is-done .nav-title::before { content: "✓ "; color: var(--tip); font-weight: 600; }
.nav a.active.is-done .nav-title::before { color: #9fd3b4; }
.nav li + li.gap { margin-top: 12px; }
.nav .repo { display: inline-block; margin-top: 24px; font-size: 14px; }
.nav-toggle { display: none; }

/* Main column */
main { padding: 48px 56px 120px; min-width: 0; }
.hero { padding-bottom: 8px; }
.hero h1 { font: 600 44px/1.1 var(--display); letter-spacing: -0.5px; margin: 8px 0 12px; }
.event { color: var(--muted); font-size: 16px; margin: 0 0 24px; }
section { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 32px 36px; margin-top: 28px; }
section.extra { background: transparent; border-style: dashed; }
.section-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
section h2 { font: 600 30px/1.2 var(--display); margin: 0 0 10px; }
section > p:first-of-type em, .scenario em { color: var(--muted); }
p { margin: 14px 0; }
p.meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; color: var(--muted); font-size: 15px; margin-top: 0; }
p.meta strong { color: var(--ink); }
.done-toggle { flex: none; font: 500 14px var(--sans); color: var(--muted); background: transparent; border: 1px solid var(--line); border-radius: 999px; padding: 7px 14px; cursor: pointer; margin-top: 4px; }
.done-toggle:hover { border-color: var(--muted); color: var(--ink); }
.done-toggle[aria-pressed="true"] { background: var(--tip-soft); border-color: var(--tip); color: var(--tip); }

/* Prompts */
.code { position: relative; margin: 16px 0; }
.code pre { margin: 0; background: var(--navy); color: var(--code-ink); border-radius: 12px; padding: 18px 96px 18px 20px; font: 15px/1.6 var(--mono); white-space: pre-wrap; word-break: break-word; }
.code pre code { background: none; padding: 0; font-size: inherit; color: inherit; }
.copy { position: absolute; top: 10px; right: 10px; font: 600 14px var(--sans); color: var(--navy); background: #f0a27e; border: 0; border-radius: 8px; padding: 8px 14px; cursor: pointer; }
.copy:hover { background: #f4b797; }
.copy.copied { background: #9fd3b4; }
.copy:focus-visible, .done-toggle:focus-visible, summary:focus-visible, .nav a:focus-visible { outline: 3px solid var(--note); outline-offset: 2px; }

/* Callouts */
.callout { padding: 12px 16px; border-radius: 10px; }
.callout.done { background: var(--tip-soft); }
.callout.why { background: var(--soft); }
.callout.try { background: var(--note-soft); }
blockquote { margin: 16px 0; padding: 4px 20px; border-left: 4px solid var(--line); color: var(--ink); }
.alert { border-radius: 12px; padding: 6px 20px; margin: 16px 0; border: 1px solid; }
.alert-title { font-weight: 600; margin-bottom: 0; }
.alert.important { background: var(--accent-soft); border-color: #e5c3b2; }
.alert.important .alert-title { color: var(--accent); }
.alert.tip { background: var(--tip-soft); border-color: #bfd9c8; }
.alert.tip .alert-title { color: var(--tip); }
.alert.note, .alert.warning, .alert.caution { background: var(--note-soft); border-color: #c5d5e8; }
.alert.note .alert-title { color: var(--note); }
details { border: 1px solid var(--line); border-radius: 10px; margin: 14px 0; background: var(--bg); }
summary { cursor: pointer; padding: 12px 16px; font-weight: 500; }
.details-body { padding: 0 16px 8px; }
.table { overflow-x: auto; margin: 16px 0; }
table { border-collapse: collapse; width: 100%; font-size: 15px; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-weight: 600; background: var(--soft); }
ol, ul { padding-left: 22px; }
li { margin: 6px 0; }

/* Phones and narrow windows */
@media (max-width: 900px) {
  .layout { display: block; }
  aside.nav { position: sticky; z-index: 5; height: auto; max-height: 100vh; padding: 12px 16px; border-right: 0; border-bottom: 1px solid var(--line); background: var(--bg); }
  .nav h2, .nav .repo, .brand { display: none; }
  .nav-toggle { display: flex; width: 100%; justify-content: space-between; align-items: center; font: 600 15px var(--sans); color: var(--ink); background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; cursor: pointer; }
  .nav ol { display: none; margin-top: 8px; }
  .nav.open ol { display: block; }
  main { padding: 24px 16px 80px; }
  .hero h1 { font-size: 32px; }
  section { padding: 22px 18px; border-radius: 12px; }
  section h2 { font-size: 24px; }
  .section-head { flex-direction: column; gap: 4px; }
  .code pre { padding: 54px 16px 16px; font-size: 14px; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
</style>
</head>
<body>
<div class="layout">
  <aside class="nav" aria-label="Workshop steps">
    <p class="brand">Hands-on workshop</p>
    <h2>${esc(title)}</h2>
    <button class="nav-toggle" type="button" aria-expanded="false"><span>Steps</span><span aria-hidden="true">▾</span></button>
    <ol>${navHtml}</ol>
    <a class="repo" href="${REPO_URL}" target="_blank" rel="noopener">The project on GitHub ↗</a>
  </aside>
  <main>
    <header class="hero">
      <p class="brand">Hands-on workshop</p>
      <h1>${esc(title)}</h1>
      ${eventLine ? `<p class="event">${inline(eventLine)}</p>` : ""}
      ${blocks(intro)}
    </header>
    ${body}
  </main>
</div>
<script>
  // Copy buttons: copy the prompt exactly as written.
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy");
    if (!btn) return;
    const text = btn.parentElement.querySelector("code").textContent;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch {} t.remove();
    }
    btn.textContent = "Copied"; btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1600);
  });

  // "Mark step done" is remembered in this browser only.
  const KEY = "workshop-done";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  function paintDone() {
    const done = load();
    document.querySelectorAll(".done-toggle").forEach((b) => {
      const on = Boolean(done[b.dataset.step]);
      b.setAttribute("aria-pressed", on); b.textContent = on ? "✓ Done" : "Mark step done";
      document.querySelector('.nav a[data-id="' + b.dataset.step + '"]')?.classList.toggle("is-done", on);
    });
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".done-toggle");
    if (!b) return;
    const done = load(); done[b.dataset.step] = !done[b.dataset.step]; save(done); paintDone();
  });
  paintDone();

  // Highlight the step on screen in the sidebar.
  const links = [...document.querySelectorAll(".nav a[data-id]")];
  const spy = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.dataset.id === en.target.id));
  }, { rootMargin: "-20% 0px -70% 0px" });
  document.querySelectorAll("main section").forEach((s) => spy.observe(s));

  // On phones the step list folds away.
  const nav = document.querySelector("aside.nav"), toggle = document.querySelector(".nav-toggle");
  toggle.addEventListener("click", () => { const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", open); });
  links.forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }));
</script>
</body>
</html>
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), page);
const prompts = (md.match(/^```/gm) || []).length / 2;
console.log(`Built site/dist/index.html: ${shown.length} sections, ${prompts} copyable blocks.`);
const unique = [...new Set(warnings)];
if (unique.length) console.warn(`Still to fill in before the session:\n  ${unique.join("\n  ")}`);
