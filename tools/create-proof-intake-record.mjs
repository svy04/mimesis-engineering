#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const inputIndex = args.indexOf("--input");
const outputIndex = args.indexOf("--output");

const inputPath = path.resolve(
  root,
  inputIndex >= 0 && args[inputIndex + 1] ? args[inputIndex + 1] : "examples/permissioned-case-intake.md",
);
const outputPath = path.resolve(
  root,
  outputIndex >= 0 && args[outputIndex + 1] ? args[outputIndex + 1] : ".mimesis/proof-intake/fixture-record.json",
);

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function sectionValue(content, heading) {
  const lines = content.split(/\r?\n/);
  const normalizedHeading = normalize(heading);
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^#{1,6}\s+(.+)$/);
    if (match && normalize(match[1]) === normalizedHeading) {
      start = index + 1;
      break;
    }
  }

  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start)) {
    if (/^#{1,6}\s+/.test(line)) {
      break;
    }
    collected.push(line);
  }

  return collected.join("\n").trim();
}

function normalizePublication(value) {
  const lowered = value.toLowerCase();
  if (lowered.includes("private only")) {
    return "private only";
  }
  if (lowered.includes("anonym")) {
    return "anonymized";
  }
  if (lowered.includes("redact")) {
    return "redacted";
  }
  return "public";
}

function listFromSection(value) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function prohibitedClaimsFromBoundary(value) {
  const withoutPrefix = value
    .replace(/^[\s\S]*?\bmust not claim\b/i, "")
    .replace(/\.$/, "")
    .replace(/\bor\b/gi, ",");

  const claims = withoutPrefix
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return claims.length ? claims : [value.trim()];
}

function safetyConfirmation(value) {
  const lowered = value.toLowerCase();
  return {
    noSecrets: /no secrets|did not include secrets|no tokens|passwords|tokens/.test(lowered),
    noPrivateCustomerData: /no private|private customer data|customer data|real submitter data/.test(lowered),
    noCopiedProtectedMaterial: /copied protected material|protected material|copied protected/.test(lowered),
  };
}

function buildRecord(markdown) {
  const publicationPreference = normalizePublication(sectionValue(markdown, "Publication Preference"));
  const safety = safetyConfirmation(sectionValue(markdown, "Safety Confirmation"));

  return {
    schemaVersion: "0.1.0",
    status: publicationPreference === "private only" ? "private only" : "reviewed",
    submitter: sectionValue(markdown, "Submitter"),
    startingArtifact: sectionValue(markdown, "Starting Artifact"),
    artifactOwner: sectionValue(markdown, "Artifact Owner"),
    permissionStatus: sectionValue(markdown, "Permission Status"),
    publicationPreference,
    redactionRequirements: sectionValue(markdown, "Redaction Requirements"),
    referencesStudied: listFromSection(sectionValue(markdown, "References Studied")),
    desiredTransformation: sectionValue(markdown, "Desired Transformation"),
    proofBoundary: listFromSection(sectionValue(markdown, "Proof Boundary")),
    safetyConfirmation: safety,
    prohibitedClaims: prohibitedClaimsFromBoundary(sectionValue(markdown, "Proof Boundary")),
  };
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

if (!fs.existsSync(inputPath)) {
  throw new Error(`Proof intake markdown does not exist: ${inputPath}`);
}

const record = buildRecord(fs.readFileSync(inputPath, "utf8"));
const serialized = stableStringify(record);

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(`${path.relative(root, outputPath).replaceAll(path.sep, "/")} is missing; run npm run proof:intake-record`);
  }
  const current = fs.readFileSync(outputPath, "utf8");
  if (current !== serialized) {
    throw new Error(`${path.relative(root, outputPath).replaceAll(path.sep, "/")} is stale; run npm run proof:intake-record`);
  }
  console.log("Mimesis proof intake record check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, serialized);

console.log(`[proof-intake-record] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);
