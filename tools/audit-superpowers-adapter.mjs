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

function requireIncludes(label, content, needles) {
  for (const needle of needles) {
    if (!content.includes(needle)) {
      failures.push(`${label}: missing ${needle}`);
    }
  }
}

const adapterDoc = read("adapters/superpowers.md");
const docs = read("docs/SUPERPOWERS-ADAPTER.md");
const prompt = read("prompts/superpowers-mimesis.md");
const packet = read(".mimesis/adapter-packets/superpowers.md");
const createCliPacket = read("tools/create-cli-packet.mjs");
const cli = read("bin/mimesis.mjs");
const packageJson = read("package.json");
const readme = read("README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrder = read("docs/RELEASE-CHECK-ORDER.md");
const manifestTool = read("tools/create-framework-manifest.mjs");
const validateTool = read("tools/validate-mimesis.mjs");

requireIncludes("adapter doc", adapterDoc, [
  "Status: `contract`",
  "Superpowers",
  "Give AI standards, not roles.",
  "Bring one weak artifact.",
  "does not prove",
]);

requireIncludes("docs", docs, [
  "# Superpowers Adapter",
  "Superpowers",
  "Import -> Distill -> Capsule -> Shard -> Verify -> Remember",
  "does not install",
  "does not prove",
]);

requireIncludes("prompt", prompt, [
  "Use Superpowers for process discipline.",
  "Use Mimesis Engineering for artifact standards.",
  "Give AI standards, not roles.",
  "Bring one weak artifact.",
  "Do not invent proof.",
]);

requireIncludes("generated packet", packet, [
  "# Mimesis CLI Packet: superpowers",
  "adapters/superpowers.md",
  "Use Superpowers for process discipline.",
  "Use Mimesis Engineering for artifact standards.",
  "does not prove that superpowers was executed",
]);

requireIncludes("create-cli-packet", createCliPacket, [
  "superpowers",
  "prompts/superpowers-mimesis.md",
]);

requireIncludes("CLI", cli, [
  "\"adapter:superpowers\"",
  "\"audit:superpowers-adapter\"",
]);

requireIncludes("package scripts", packageJson, [
  "\"adapter:superpowers\"",
  "\"audit:superpowers-adapter\"",
  "npm run adapter:superpowers",
  "npm run audit:superpowers-adapter",
]);

requireIncludes("README", readme, [
  "Superpowers adapter",
  "npm run adapter:superpowers",
  "npm run audit:superpowers-adapter",
]);

requireIncludes("STATUS", status, [
  "Superpowers adapter",
  "adapter:superpowers",
  "audit:superpowers-adapter",
]);

requireIncludes("ROADMAP", roadmap, [
  "Superpowers adapter",
  "adapter:superpowers",
  "audit:superpowers-adapter",
]);

requireIncludes("release packet", releasePacket, [
  "Superpowers adapter",
  "adapter:superpowers",
  "audit:superpowers-adapter",
]);

requireIncludes("release order", releaseOrder, [
  "Superpowers adapter",
  "`adapter:superpowers` runs before",
  "`audit:superpowers-adapter` runs after",
]);

requireIncludes("framework manifest tool", manifestTool, [
  "Superpowers adapter",
  ".mimesis/adapter-packets/superpowers.md",
  "adapter:superpowers",
]);

requireIncludes("validator", validateTool, [
  "docs/SUPERPOWERS-ADAPTER.md",
  "adapters/superpowers.md",
  ".mimesis/adapter-packets/superpowers.md",
  "prompts/superpowers-mimesis.md",
  "tools/audit-superpowers-adapter.mjs",
]);

if (failures.length) {
  console.error("\nMimesis Superpowers adapter audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis Superpowers adapter audit passed.");
