# Gate Evidence Issue Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub issue form for submitting gate-closing evidence without treating the issue as proof, publication, adoption, benchmark evidence, or gate closure.

**Architecture:** Add a static issue form plus a focused audit that checks form fields, safety boundaries, package/CLI wiring, release preflight order, validator coverage, manifest visibility, release artifact coverage, and public docs. Keep the form as intake only; evidence still must pass the existing evidence packet and review commands.

**Tech Stack:** GitHub issue forms YAML, Node.js ESM audit scripts, existing package scripts, CLI command map, `.mimesis` manifests, and release audits.

---

### Task 1: Failing Audit

**Files:**
- Create: `tools/audit-gate-evidence-issue-form.mjs`
- Modify: `package.json`
- Modify: `bin/mimesis.mjs`
- Modify: `tools/audit-cli.mjs`

- [ ] **Step 1: Write the failing audit**

Create `tools/audit-gate-evidence-issue-form.mjs` requiring:

```text
.github/ISSUE_TEMPLATE/gate-evidence.yml
docs/GATE-EVIDENCE-ISSUE.md
tools/audit-gate-evidence-issue-form.mjs
audit:gate-evidence-issue-form
```

The audit must require issue form ids:

```text
gate_id
evidence_type
evidence_links
evidence_summary
permission_boundary
review_state
allowed_claim
disallowed_claim
safety_confirmation
```

The audit must reject fake engagement language and require boundary language that the issue does not close gates or create proof.

- [ ] **Step 2: Verify RED**

Run:

```bash
node tools/audit-gate-evidence-issue-form.mjs
```

Expected: FAIL because the issue form, docs, scripts, CLI wiring, validator coverage, and manifests do not exist yet.

### Task 2: Form And Docs

**Files:**
- Create: `.github/ISSUE_TEMPLATE/gate-evidence.yml`
- Create: `docs/GATE-EVIDENCE-ISSUE.md`
- Modify: `tools/audit-issue-forms.mjs`
- Modify: `tools/validate-mimesis.mjs`
- Modify: `README.md`
- Modify: `tools/README.md`
- Modify: `STATUS.md`
- Modify: `ROADMAP.md`
- Modify: `docs/COMPLETION-AUDIT.md`
- Modify: `docs/V0.1-RELEASE-PACKET.md`
- Modify: `docs/STATUS-ROADMAP-SYNC.md`

- [ ] **Step 1: Add the issue form**

Create `.github/ISSUE_TEMPLATE/gate-evidence.yml` with required fields for gate id, evidence type, evidence links, summary, permission boundary, review state, allowed claim, disallowed claim, and safety confirmations.

- [ ] **Step 2: Add the public doc**

Create `docs/GATE-EVIDENCE-ISSUE.md` explaining that the issue form is evidence intake only and must be routed through `evidence:check`, `evidence:review`, and gate closure review before any claim.

- [ ] **Step 3: Wire public status**

Update README, tools README, STATUS, ROADMAP, completion audit, release packet, and status/roadmap sync docs to name the new issue form and boundary.

### Task 3: Manifests And Verification

**Files:**
- Modify: `tools/create-framework-manifest.mjs`
- Modify: `tools/audit-framework-manifest.mjs`
- Modify: `tools/create-release-artifact-manifest.mjs`
- Modify: `tools/audit-release-artifact-manifest.mjs`
- Modify: `tools/audit-release-check-order.mjs`
- Modify: `.mimesis/run_ledger.md`

- [ ] **Step 1: Register the surface**

Add `audit:gate-evidence-issue-form` to package scripts, CLI, framework manifest, release artifact manifest, release order audit, and validator required paths. Keep it as an audit only; no generator is needed.

- [ ] **Step 2: Regenerate generated manifests**

Run:

```bash
npm run framework:manifest
npm run release:artifact-manifest
```

- [ ] **Step 3: Verify**

Run:

```bash
npm run audit:gate-evidence-issue-form
npm run audit:issues
npm run audit:framework-manifest
npm run audit:release-artifact-manifest
npm run audit:release-order
npm run audit:status-roadmap
npm run audit:completion
npm run validate
npm run release:check
```

Expected: all pass. The active goal remains open because owner, proof, publication, benchmark, and adoption gates remain.
