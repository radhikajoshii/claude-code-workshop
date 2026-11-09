// A tiny web server with no packages to install.
// It serves the dashboard in public/ and the pack in output/,
// and saves flag reviews to reviews/notes.json so they survive when the pipeline reruns.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const NOTES = path.join(ROOT, "reviews", "notes.json");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function readNotes() {
  try { return JSON.parse(fs.readFileSync(NOTES, "utf8")); } catch { return {}; }
}

// POST /api/notes with { key, reviewed, note } saves one flag's review.
function saveNote(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 10000) req.destroy(); // a note, not a novel
  });
  req.on("end", () => {
    let input;
    try { input = JSON.parse(body); } catch { return send(res, 400, "Expected JSON"); }
    if (typeof input.key !== "string" || !input.key) return send(res, 400, "Missing key");
    const notes = readNotes();
    if (!input.reviewed && !String(input.note || "").trim()) delete notes[input.key];
    else notes[input.key] = { reviewed: Boolean(input.reviewed), note: String(input.note || "").slice(0, 1000), updated_at: new Date().toISOString() };
    fs.mkdirSync(path.dirname(NOTES), { recursive: true });
    fs.writeFileSync(NOTES, JSON.stringify(notes, null, 2));
    send(res, 200, JSON.stringify(notes), TYPES[".json"]);
  });
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);

    if (urlPath === "/api/notes") {
      if (req.method === "GET") return send(res, 200, JSON.stringify(readNotes()), TYPES[".json"]);
      if (req.method === "POST") return saveNote(req, res);
      return send(res, 405, "Method not allowed");
    }

    const relative = urlPath === "/" ? "public/index.html" : urlPath.startsWith("/output/") ? urlPath.slice(1) : path.join("public", urlPath);
    const file = path.resolve(ROOT, relative);

    // Only serve files from public/ and output/.
    const allowed = [path.join(ROOT, "public") + path.sep, path.join(ROOT, "output") + path.sep];
    if (!allowed.some((dir) => file.startsWith(dir))) return send(res, 404, "Not found");

    fs.readFile(file, (err, contents) => {
      if (err) return send(res, 404, "Not found");
      send(res, 200, contents, TYPES[path.extname(file)] || "application/octet-stream");
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Portfolio dashboard running at http://localhost:${PORT}`);
  });
