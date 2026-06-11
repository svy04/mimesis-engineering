# Gate Evidence Issue Convert Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert a GitHub Gate Evidence issue body into a draft evidence packet candidate without claiming proof, review, publication, adoption, benchmark results, or gate closure.

**Architecture:** Add a local markdown-to-evidence-packet converter with a fixture issue, generated draft packet, conversion report, and focused audit. Wire the command through package scripts, CLI, release preflight, validators, manifests, release artifacts, and public docs while keeping `evidence:review` and gate closure review as separate downstream steps.

**Tech Stack:** Node.js ESM scripts, Markdown section parsing, existing evidence packet checker, package scripts, `.mimesis` generated artifacts, GitHub issue form conventions.

---

### Task 1: RED Audit

**Files:**
- Create: `tools/audit-gate-evidence-issue-convert.mjs`

- [ ] **Step 1: Write the failing audit**

Create an audit that requires:

```text
gate:evidence-issue-convert
audit:gate-evidence-issue-convert
tools/convert-gate-evidence-issue.mjs
docs/GATE-EVIDENCE-ISSUE-CONVERT.md
.mimesis/gates/fixture-gate-evidence-issue.md
.mimesis/gates/fixture-gate-evidence-packet.md
.mimesis/gates/fixture-gate-evidence-issue-conversion-report.md
```

It must also smoke-run the converter into a temporary directory and then run `tools/check-evidence-packet.mjs` on the generated draft packet.

- [ ] **Step 2: Verify RED**

Run:

```bash
node tools/audit-gate-evidence-issue-convert.mjs
```

Expected: FAIL because the converter, docs, fixture outputs, scripts, CLI wiring, validator coverage, manifests, and public docs are missing.

### Task 2: Converter And Fixture

**Files:**
- Create: `tools/convert-gate-evidence-issue.mjs`
- Create: `docs/GATE-EVIDENCE-ISSUE-CONVERT.md`
- Create: `.mimesis/gates/fixture-gate-evidence-issue.md`
- Generate: `.mimesis/gates/fixture-gate-evidence-packet.md`
- Generate: `.mimesis/gates/fixture-gate-evidence-issue-conversion-report.md`
- Modify: `tools/check-evidence-packet.mjs`
- Modify: `templates/evidence-packet.md`

- [ ] **Step 1: Implement the converter**

Parse GitHub issue body sections for `gate_id`, `evidence_type`, `evidence_links`, `evidence_summary`, `permission_boundary`, `review_state`, `allowed_claim`, `disallowed_claim`, and `safety_confirmation`.

- [ ] **Step 2: Produce a draft evidence packet**

Map the issue fields into the existing evidence packet headings and keep `Review Decision` as `draft.`

- [ ] **Step 3: Keep gate evidence packet classes checkable**

Extend the evidence packet checker/template to allow gate evidence classes such as `owner decision`, `sync verification`, and `gate evidence` without making them proof claims.

### Task 3: Wiring, Docs, And Verification

**Files:**
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
- Modify: `docs/COMPLETION-AUDIT.md`
- Modify: `tools/audit-completion-matrix.mjs`
- Modify: `.mimesis/run_ledger.md`

- [ ] **Step 1: Wire commands and manifests**

Add `gate:evidence-issue-convert` and `audit:gate-evidence-issue-convert` to the package scripts, CLI, release order audit, validator, framework manifest generator/audit, and release artifact manifest generator/audit.

- [ ] **Step 2: Update public docs**

Name the converter in README, tools README, STATUS, ROADMAP, release packet, status/roadmap sync docs, and completion audit with no-proof/no-closure boundaries.

- [ ] **Step 3: Verify**

Run:

```bash
npm run gate:evidence-issue-convert
npm run audit:gate-evidence-issue-convert
npm run audit:gate-evidence-issue-form
npm run audit:framework-manifest
npm run audit:release-artifact-manifest
npm run audit:release-order
npm run audit:status-roadmap
npm run audit:completion
npm run audit:completion-row-count
npm run validate
git diff --check
npm run release:check
```

Expected: all pass. The active goal remains open because the converter creates a draft evidence packet candidate only.
