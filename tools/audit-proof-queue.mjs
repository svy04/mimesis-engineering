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

const packageJson = JSON.parse(read("package.json"));
const cli = read("bin/mimesis.mjs");
const queue = read("docs/V0.2-PROOF-QUEUE.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");

if (!packageJson.scripts?.["audit:proof-queue"]) {
  failures.push("package.json missing script: audit:proof-queue");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:proof-queue")) {
  failures.push("release:check must include npm run audit:proof-queue");
}

if (!cli.includes('"audit:proof-queue"')) {
  failures.push("CLI missing audit:proof-queue command");
}

for (const text of [
  "No permissioned external weak artifact has been submitted yet",
  "case:review",
  "case:from-intake",
  "case:check",
  "evidence:from-case",
  "evidence:review",
  "evidence:check",
  "claim:from-evidence",
  "proof:readiness",
  "release:check:public",
  "case:check` should fail until",
  "does not prove external adoption",
  "Do not claim v0.2 external proof",
  "v0.2 Exit Claim",
]) {
  if (!queue.includes(text)) {
    failures.push(`proof queue missing required text: ${text}`);
  }
}

if (!/permission status/i.test(queue) || !/publication preference/i.test(queue) || !/redaction requirements/i.test(queue)) {
  failures.push("proof queue must keep permission, publication, and redaction fields visible");
}

if (!/Mimesis is externally adopted, benchmarked, legally original, commercially proven, or universally effective/i.test(queue)) {
  failures.push("proof queue must include a disallowed v0.2 overclaim");
}

if (!completionAudit.includes("v0.2 proof queue")) {
  failures.push("completion audit must include v0.2 proof queue row");
}

if (!releasePacket.includes("V0.2 Proof Queue")) {
  failures.push("release packet must link the v0.2 proof queue");
}

if (failures.length) {
  console.error("\nMimesis proof queue audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof queue audit passed: v0.2 proof path is explicit and bounded.");
