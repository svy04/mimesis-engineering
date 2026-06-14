#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginsDir = path.join(root, "plugins");
const validStatuses = new Set(["idea", "contract", "prototype", "usable", "verified"]);
const evidenceStatuses = new Set(["prototype", "usable", "verified"]);
const failures = [];
const pluginFiles = fs
  .readdirSync(pluginsDir)
  .filter((name) => name.endsWith(".md") && name !== "README.md" && name !== "status.md");

for (const file of pluginFiles) {
  const relative = `plugins/${file}`;
  const content = fs.readFileSync(path.join(pluginsDir, file), "utf8");
  const statusMatch = content.match(/Status:\s*`([^`]+)`/);

  if (!statusMatch) {
    failures.push(`${relative}: missing Status label`);
    continue;
  }

  const status = statusMatch[1];
  if (!validStatuses.has(status)) {
    failures.push(`${relative}: invalid status ${status}`);
    continue;
  }

  console.log(`[plugin] ${relative} status=${status}`);

  if (evidenceStatuses.has(status)) {
    if (!/workflow|\.github\/workflows|npm run|case note|evidence/i.test(content)) {
      failures.push(`${relative}: ${status} status requires local evidence references`);
    }
  }
}

const statusMatrix = fs.readFileSync(path.join(pluginsDir, "status.md"), "utf8");
for (const file of pluginFiles) {
  const label = file
    .replace(".md", "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  if (!statusMatrix.toLowerCase().includes(label.toLowerCase())) {
    failures.push(`plugins/status.md missing matrix entry for ${label}`);
  }
}

const githubActionDoc = fs.readFileSync(path.join(pluginsDir, "github-action.md"), "utf8");
const githubActionStatus = githubActionDoc.match(/Status:\s*`([^`]+)`/)?.[1];
if (githubActionStatus === "usable") {
  const actionPath = path.join(root, ".github", "actions", "release-check", "action.yml");
  const workflowPath = path.join(root, ".github", "workflows", "validate-mimesis.yml");

  if (!fs.existsSync(actionPath)) {
    failures.push("GitHub Action usable status requires .github/actions/release-check/action.yml");
  } else {
    const action = fs.readFileSync(actionPath, "utf8");
    if (!/using:\s*composite/i.test(action)) {
      failures.push("GitHub Action usable status requires a composite action.yml");
    }
    if (!/npm run release:check/.test(action)) {
      failures.push("GitHub Action usable status requires action.yml to run npm run release:check");
    }
  }

  if (!fs.existsSync(workflowPath)) {
    failures.push("GitHub Action usable status requires .github/workflows/validate-mimesis.yml");
  } else {
    const workflow = fs.readFileSync(workflowPath, "utf8");
    if (!/\.\/\.github\/actions\/release-check/.test(workflow)) {
      failures.push("GitHub Action usable status requires workflow to call the local release-check action");
    }
  }
}

if (failures.length) {
  console.error("\nMimesis plugin audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`\nMimesis plugin audit passed: ${pluginFiles.length} plugin shapes checked.`);
