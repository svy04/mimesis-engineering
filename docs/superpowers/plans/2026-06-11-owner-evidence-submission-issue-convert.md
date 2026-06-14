# Owner Evidence Submission Issue Convert Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded converter from an owner evidence submission issue body into a draft owner evidence submission record.

**Architecture:** Follow the existing `owner:proof-input-issue-convert` and `gate:evidence-issue-convert` patterns. The converter parses `###` issue sections into the existing owner evidence submission record schema, then writes a conversion report that keeps all gates open unless later review commands prove readiness.

**Tech Stack:** Node.js ESM scripts, JSON/Markdown fixture artifacts, npm scripts, Mimesis release-check audits.

---

### Task 1: RED Audit

**Files:**
- Create: `tools/audit-owner-evidence-submission-issue-convert.mjs`

- [ ] **Step 1: Write the failing audit**

Create an audit that requires:

- `tools/convert-owner-evidence-submission-issue.mjs`
- `docs/OWNER-EVIDENCE-SUBMISSION-ISSUE-CONVERT.md`
- `.mimesis/owner-actions/fixture-owner-evidence-submission-issue.md`
- `.mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json`
- `.mimesis/owner-actions/fixture-owner-evidence-submission-issue-conversion-report.md`
- package scripts `owner:evidence-submission-issue-convert` and `audit:owner-evidence-submission-issue-convert`
- CLI, validator, framework manifest, release artifact manifest, release order, README, tools README, STATUS, ROADMAP, release packet, completion audit, and status/roadmap sync references

- [ ] **Step 2: Run RED audit**

Run: `node tools/audit-owner-evidence-submission-issue-convert.mjs`

Expected: FAIL because the converter, docs, fixtures, scripts, and wiring do not exist yet.

### Task 2: Converter And Fixture

**Files:**
- Create: `tools/convert-owner-evidence-submission-issue.mjs`
- Create: `.mimesis/owner-actions/fixture-owner-evidence-submission-issue.md`
- Generate: `.mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json`
- Generate: `.mimesis/owner-actions/fixture-owner-evidence-submission-issue-conversion-report.md`

- [ ] **Step 1: Implement parser and record builder**

The converter must parse these issue sections:

- `license_or_no_reuse`
- `weak_artifact_permission`
- `publication_scope`
- `package_action_plugin_scope`
- `benchmark_adoption_scope`
- `strict_sync_intent`
- `review_state`
- `safety_confirmation`

Default output status must be `draft`. A field is `submitted` only when it has non-placeholder text. The fixture must include `license_or_no_reuse` as a submitted draft field and keep the rest missing.

- [ ] **Step 2: Generate fixture output**

Run: `npm run owner:evidence-submission-issue-convert`

Expected: writes fixture record and conversion report; report says `ready for gate movement: no`.

- [ ] **Step 3: Check fixture record**

Run: `node tools/check-owner-evidence-submission-record.mjs .mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json --require-field license_or_no_reuse --write-report .mimesis/owner-actions/fixture-owner-evidence-submission-issue-check.md`

Expected: FAIL until status is explicitly reviewed; this proves draft submitted evidence is not enough for field movement.

### Task 3: Public Wiring

**Files:**
- Create: `docs/OWNER-EVIDENCE-SUBMISSION-ISSUE-CONVERT.md`
- Modify: `package.json`
- Modify: `bin/mimesis.mjs`
- Modify: `tools/audit-cli.mjs`
- Modify: `tools/validate-mimesis.mjs`
- Modify: `tools/create-framework-manifest.mjs`
- Modify: `tools/audit-framework-manifest.mjs`
- Modify: `tools/create-release-artifact-manifest.mjs`
- Modify: `tools/audit-release-artifact-manifest.mjs`
- Modify: `tools/audit-release-check-order.mjs`
- Modify: `docs/RELEASE-CHECK-ORDER.md`
- Modify: `README.md`
- Modify: `tools/README.md`
- Modify: `STATUS.md`
- Modify: `ROADMAP.md`
- Modify: `docs/V0.1-RELEASE-PACKET.md`
- Modify: `docs/STATUS-ROADMAP-SYNC.md`
- Modify: `tools/audit-status-roadmap-sync.mjs`
- Modify: `tools/audit-completion-matrix.mjs`
- Modify: `docs/COMPLETION-AUDIT.md`

- [ ] **Step 1: Wire scripts and CLI**

Add:

- `owner:evidence-submission-issue-convert`
- `audit:owner-evidence-submission-issue-convert`

Release order must run conversion after `owner:evidence-submission-record` and before `owner:evidence-submission-check`.

- [ ] **Step 2: Wire manifests and public docs**

Add the new docs, fixture issue, fixture record, report, converter, and audit to required-file validation and release artifact hashing. Public docs must state this is a draft owner evidence submission record candidate, not an owner decision, not attached evidence, not permission, not proof, and not gate closure.

### Task 4: Verify And Remember

**Files:**
- Modify: `.mimesis/run_ledger.md`

- [ ] **Step 1: Run targeted checks**

Run:

- `npm run owner:evidence-submission-issue-convert`
- `npm run audit:owner-evidence-submission-issue-convert`
- `npm run audit:owner-evidence-submission-check`
- `npm run audit:framework-manifest`
- `npm run audit:release-artifact-manifest`
- `npm run audit:release-order`
- `npm run audit:status-roadmap`
- `npm run audit:completion`
- `npm run validate`

- [ ] **Step 2: Run full preflight**

Run: `npm run release:check`

Expected: PASS while `openGateCount: 9`, `gapCount: 9`, and `goalComplete: false` remain.

- [ ] **Step 3: Ledger**

Append Import/Distill/Capsule/Shard/Verify/Remember notes to `.mimesis/run_ledger.md`.

---

## Self-Review

- Spec coverage: the plan adds only an intake conversion path and does not claim any gate closure.
- Placeholder scan: no TBD/TODO placeholders are used in the plan.
- Type consistency: generated records keep the existing owner evidence submission schema consumed by `check-owner-evidence-submission-record.mjs`.
