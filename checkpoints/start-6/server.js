// A tiny web server with no packages to install.
// It serves the page in public/ and the data in data/.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relative = urlPath === "/" ? "public/index.html" : urlPath.startsWith("/data/") ? urlPath.slice(1) : path.join("public", urlPath);
    const file = path.resolve(ROOT, relative);

    // Only serve files from public/ and data/.
    const allowed = [path.join(ROOT, "public") + path.sep, path.join(ROOT, "data") + path.sep];
    if (!allowed.some((dir) => file.startsWith(dir))) return send(res, 404, "Not found");

    fs.readFile(file, (err, contents) => {
      if (err) return send(res, 404, "Not found");
      send(res, 200, contents, TYPES[path.extname(file)] || "application/octet-stream");
    });
  })
  .listen(PORT, () => {
    console.log(`Follow-up tracker running at http://localhost:${PORT}`);
  });
