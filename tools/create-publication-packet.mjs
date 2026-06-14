#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "publication-packets", "v0.1.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function extractSection(content, heading) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) {
      break;
    }
    collected.push(line);
  }
  return collected.join("\n").trim();
}

function rewriteRelativeLinks(markdown, sourceDir, outputDir) {
  return markdown.replace(/(!?\[[^\]]*\])\(([^)]+)\)/g, (match, label, target) => {
    if (
      !target ||
      target.startsWith("#") ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)
    ) {
      return match;
    }

    const [targetPath, fragment = ""] = target.split("#", 2);
    const absoluteTarget = path.resolve(root, sourceDir, targetPath);
    let rewritten = path.relative(path.join(root, outputDir), absoluteTarget).replaceAll(path.sep, "/");
    if (!rewritten.startsWith(".")) {
      rewritten = `./${rewritten}`;
    }
    if (fragment) {
      rewritten = `${rewritten}#${fragment}`;
    }
    return `${label}(${rewritten})`;
  });
}

const packageJson = JSON.parse(read("package.json"));
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

const releasePosition = extractSection(releasePacket, "Release Position");
const allowed = extractSection(releasePacket, "Publication Notes");
const evidence = rewriteRelativeLinks(
  extractSection(releasePacket, "Evidence To Attach"),
  "docs",
  path.join(".mimesis", "publication-packets"),
);
const stopConditions = extractSection(releasePacket, "Stop Conditions");
const nextGates = extractSection(completionAudit, "Next Gates");
const allowedClaim = extractSection(completionAudit, "Allowed Completion Claim");
const disallowedClaim = extractSection(completionAudit, "Disallowed Completion Claim");

const generated = `# Mimesis Engineering v${packageJson.version} Publication Packet

Generated from the current local repository state.

## Release Summary

Mimesis Engineering v${packageJson.version} is a locally validated, Markdown-first public framework for giving AI standards, not roles.
Bring one weak artifact, run the file protocol, and leave with a stronger artifact plus a proof boundary.

## Required Preflight

\`\`\`bash
npm run release:check
\`\`\`

For a local checkout with neighboring Mimesis repositories:

\`\`\`bash
npm run release:check:workspace
\`\`\`

## Allowed Claim

${allowedClaim}

## Publication Copy

${allowed}

## Release Position

${releasePosition}

## Evidence

${evidence}

## Stop Conditions

${stopConditions}

## Disallowed Claim

${disallowedClaim}

## Remaining Gates

${nextGates}

## Boundary

This packet is a publication handoff.
It does not prove hosted deployment, external adoption, benchmarked productivity, customer outcomes, legal originality, npm package release, marketplace integration, or shipped plugins.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[publication-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);
