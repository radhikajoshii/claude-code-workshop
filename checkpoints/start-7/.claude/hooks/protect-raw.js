// Hook: stops Claude from changing or deleting the companies' original files.
// Claude Code runs this before every file edit and shell command (see .claude/settings.json).
// Exit code 2 blocks the action and tells Claude why. Exit code 0 lets it through.
const path = require("path");

const PROTECTED = ["data/raw", "new-portfolio/raw"];

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let event;
  try { event = JSON.parse(input); } catch { process.exit(0); }
  const tool = event.tool_name || "";
  const args = event.tool_input || {};
  const project = process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd();

  const isProtected = (p) => {
    const rel = path.relative(project, path.resolve(event.cwd || project, p)).split(path.sep).join("/");
    return PROTECTED.some((dir) => rel === dir || rel.startsWith(dir + "/"));
  };
  const block = (what) => {
    console.error(`Blocked by the project's hook: ${what}. The companies' original files in ${PROTECTED.join(" and ")} must never be changed or deleted. Fix the problem in the pipeline instead.`);
    process.exit(2);
  };

  // File edits: Edit, Write, MultiEdit, NotebookEdit
  const file = args.file_path || args.notebook_path;
  if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool) && file && isProtected(file)) block(`${tool} on ${file}`);

  // Shell commands that mention a protected folder and would change something in it
  if (tool === "Bash" && typeof args.command === "string") {
    const cmd = args.command.replace(/\\/g, "/");
    const touches = PROTECTED.some((dir) => cmd.includes(dir));
    const changes = /(^|[\s;&|(])(rm|rmdir|mv|unlink|truncate|tee|chmod|sed\s+-i|perl\s+-i|Remove-Item|Set-Content|Out-File|del)\b|[^0-9&]>{1,2}\s*\S*(data\/raw|new-portfolio\/raw)/.test(cmd);
    if (touches && changes) block(`the command "${args.command}"`);
  }
  process.exit(0);
});
