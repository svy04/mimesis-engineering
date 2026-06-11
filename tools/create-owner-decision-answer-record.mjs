#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const inputIndex = args.indexOf("--input");
const outputIndex = args.indexOf("--output");

const inputRelative = inputIndex >= 0 && args[inputIndex + 1]
  ? args[inputIndex + 1]
  : ".mimesis/owner-actions/decision-intake.md";
const outputRelative = outputIndex >= 0 && args[outputIndex + 1]
  ? args[outputIndex + 1]
  : ".mimesis/owner-actions/fixture-answer-record.json";

const inputPath = path.resolve(root, inputRelative);
const outputPath = path.resolve(root, outputRelative);

const requiredFields = [
  "license_or_no_reuse",
  "weak_artifact_permission",
  "publication_scope",
  "package_action_plugin_scope",
  "benchmark_adoption_scope",
  "strict_sync_intent",
];

const requiredGateIds = [
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "strict_publish_sync",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
];

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function cleanCell(value) {
  return value
    .replace(/`/g, "")
    .replace(/<br>/g, "\n")
    .trim();
}

function evidenceItems(value) {
  return cleanCell(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFormRows(markdown) {
  const fields = {};
  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("| `")) {
      continue;
    }

    const cells = trimmed
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());

    if (cells.length < 5) {
      continue;
    }

    const fieldName = cleanCell(cells[0]);
    if (!requiredFields.includes(fieldName)) {
      continue;
    }

    fields[fieldName] = {
      answerStatus: "pending",
      ownerAnswer: "pending owner answer",
      currentSignal: cleanCell(cells[2]),
      evidenceToAttach: evidenceItems(cells[3]),
      boundary: cleanCell(cells[4]),
    };
  }

  for (const field of requiredFields) {
    if (!fields[field]) {
      fields[field] = {
        answerStatus: "pending",
        ownerAnswer: "pending owner answer",
        currentSignal: "missing from owner decision intake",
        evidenceToAttach: ["owner-provided evidence required"],
        boundary: "does not close gates",
      };
    }
  }

  return fields;
}

function buildRecord(markdown) {
  return {
    schemaVersion: "0.1.0",
    status: "pending_owner_answers",
    sourceIntake: inputRelative.replaceAll(path.sep, "/"),
    fields: parseFormRows(markdown),
    requiredGateIds,
    safetyConfirmation: {
      noRealOwnerDecision: true,
      noArtifactCollected: true,
      noPermissionGranted: true,
      noPublication: true,
      noExternalProof: true,
      noClosedGates: true,
    },
    prohibitedClaims: [
      "external proof exists",
      "adoption proof exists",
      "benchmarked productivity exists",
      "customer outcomes exist",
      "publication happened",
      "license was chosen",
      "permission was granted",
      "gates are closed",
    ],
    boundaries: [
      "does_not_choose_license",
      "does_not_collect_artifact",
      "does_not_grant_permission",
      "does_not_publish",
      "does_not_create_external_proof",
      "does_not_close_gates",
    ],
  };
}

if (!fs.existsSync(inputPath)) {
  throw new Error(`Owner decision intake does not exist: ${inputPath}`);
}

const record = buildRecord(fs.readFileSync(inputPath, "utf8"));
const serialized = stableStringify(record);

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(`${path.relative(root, outputPath).replaceAll(path.sep, "/")} is missing; run npm run owner:decision-answer-record`);
  }
  const current = fs.readFileSync(outputPath, "utf8");
  if (current !== serialized) {
    throw new Error(`${path.relative(root, outputPath).replaceAll(path.sep, "/")} is stale; run npm run owner:decision-answer-record`);
  }
  console.log("Mimesis owner decision answer record check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, serialized);

console.log(`[owner-decision-answer-record] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);
