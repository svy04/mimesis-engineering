#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) {
    return {};
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

function requireText(label, content, texts) {
  for (const text of texts) {
    if (!content.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`${label} missing text: ${text}`);
    }
  }
}

const packageJson = readJson("package.json");
const issueForm = read(".github/ISSUE_TEMPLATE/gate-evidence.yml");
const doc = read("docs/GATE-EVIDENCE-ISSUE.md");
const cli = read("bin/mimesis.mjs");
const cliAudit = read("tools/audit-cli.mjs");
const issueAudit = read("tools/audit-issue-forms.mjs");
const validator = read("tools/validate-mimesis.mjs");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const statusRoadmap = read("docs/STATUS-ROADMAP-SYNC.md");
const releaseOrderAudit = read("tools/audit-release-check-order.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";

if (!packageJson.scripts?.["audit:gate-evidence-issue-form"]) {
  failures.push("package.json missing script: audit:gate-evidence-issue-form");
}

if (!releaseCheck.includes("npm run audit:gate-evidence-issue-form")) {
  failures.push("release:check missing npm run audit:gate-evidence-issue-form");
}

for (const contentCheck of [
  ["bin/mimesis.mjs", cli],
  ["tools/audit-cli.mjs", cliAudit],
]) {
  const [label, content] = contentCheck;
  if (!content.includes('"audit:gate-evidence-issue-form"')) {
    failures.push(`${label} missing audit:gate-evidence-issue-form`);
  }
}

requireText("gate evidence issue form", issueForm, [
  "name: Gate Evidence",
  "description:",
  "title:",
  "labels:",
  "body:",
  "id: gate_id",
  "id: evidence_type",
  "id: evidence_links",
  "id: evidence_summary",
  "id: permission_boundary",
  "id: review_state",
  "id: allowed_claim",
  "id: disallowed_claim",
  "id: safety_confirmation",
  "does not close gates",
  "does not create proof",
  "No proof, no claim",
]);

if (!/validations:\s*\n\s*required:\s*true/m.test(issueForm)) {
  failures.push("gate-evidence.yml must include required validations");
}

if (/fake stars|fake comments|fake testimonials|fake users|fake endorsements|fake engagement/i.test(issueForm)) {
  failures.push("gate-evidence.yml must not invite fake engagement");
}

requireText("docs/GATE-EVIDENCE-ISSUE.md", doc, [
  "Gate Evidence Issue",
  "audit:gate-evidence-issue-form",
  ".github/ISSUE_TEMPLATE/gate-evidence.yml",
  "evidence:check",
  "evidence:review",
  "does not close gates",
  "does not create proof",
  "does not prove adoption",
]);

for (const text of [
  "gate-evidence.yml",
  "gate_id",
  "evidence_links",
  "safety_confirmation",
]) {
  if (!issueAudit.includes(text)) {
    failures.push(`tools/audit-issue-forms.mjs missing gate evidence issue text: ${text}`);
  }
}

for (const text of [
  ".github/ISSUE_TEMPLATE/gate-evidence.yml",
  "docs/GATE-EVIDENCE-ISSUE.md",
  "tools/audit-gate-evidence-issue-form.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing ${text}`);
  }
}

for (const [label, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/STATUS-ROADMAP-SYNC.md", statusRoadmap],
]) {
  requireText(label, content, ["gate evidence issue"]);
}

if (!releaseOrderAudit.includes("audit:gate-evidence-issue-form")) {
  failures.push("tools/audit-release-check-order.mjs missing audit:gate-evidence-issue-form");
}

if (!frameworkManifest.commands?.some((entry) => entry.name === "audit:gate-evidence-issue-form")) {
  failures.push(".mimesis/framework-manifest.json commands missing audit:gate-evidence-issue-form");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  ".github/ISSUE_TEMPLATE/gate-evidence.yml",
  "docs/GATE-EVIDENCE-ISSUE.md",
  "tools/audit-gate-evidence-issue-form.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis gate evidence issue form audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gate evidence issue form audit passed: gate evidence issue intake is visible and bounded.");
