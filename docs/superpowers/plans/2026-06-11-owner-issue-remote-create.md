# Owner Issue Remote Create Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the missing remote GitHub issues for the 9 open Mimesis v0.2 gates without claiming proof, owner approval, or gate closure.

**Architecture:** Add a gated local command that reads the current gap register and remote issue sync snapshot, creates any missing labels and issues only with `--execute`, then writes a metadata-only creation report. Keep live remote mutation outside `release:check`; include only the audit in the release chain.

**Tech Stack:** Node.js ESM scripts, GitHub CLI `gh`, existing `.mimesis` protocol artifacts, package scripts, CLI command map, generated manifests, and release audits.

---

### Task 1: Failing Audit

**Files:**
- Create: `tools/audit-owner-issue-remote-create.mjs`

- [ ] **Step 1: Write the failing audit**

Create an audit that requires:

```text
docs/OWNER-ISSUE-REMOTE-CREATE.md
.mimesis/owner-actions/remote-issue-create.json
.mimesis/owner-actions/remote-issue-create.md
tools/create-owner-issue-remote-create.mjs
tools/audit-owner-issue-remote-create.mjs
owner:issue-remote-create
audit:owner-issue-remote-create
```

The audit must reject any claim that remote issue creation closes gates, chooses a license, collects an artifact, creates external proof, proves adoption, proves benchmark results, publishes, or stores issue bodies.

- [ ] **Step 2: Verify RED**

Run:

```bash
node tools/audit-owner-issue-remote-create.mjs
```

Expected: FAIL because the remote-create files, commands, docs, and manifests do not exist yet.

### Task 2: Remote Creator

**Files:**
- Create: `tools/create-owner-issue-remote-create.mjs`
- Create: `docs/OWNER-ISSUE-REMOTE-CREATE.md`
- Generate: `.mimesis/owner-actions/remote-issue-create.json`
- Generate: `.mimesis/owner-actions/remote-issue-create.md`

- [ ] **Step 1: Implement dry-run by default**

The script must read `.mimesis/gaps/current-gap-register.json`, compare against `gh issue list`, and write a dry-run report unless `--execute` is present.

- [ ] **Step 2: Implement execute mode**

When called with `--execute`, the script must:

```text
1. create missing labels through gh label create only when absent
2. create only missing gate issues by exact title match
3. record created issue number, URL, state, title, and labels
4. never store raw secret-like input or proof artifact bodies
```

- [ ] **Step 3: Verify GREEN**

Run:

```bash
npm run owner:issue-remote-create
npm run audit:owner-issue-remote-create
```

Expected: PASS in dry-run mode without creating issues.

### Task 3: Execute And Sync

**Files:**
- Modify generated reports under `.mimesis/owner-actions/`

- [ ] **Step 1: Execute remote creation deliberately**

Run:

```bash
npm run owner:issue-remote-create -- --execute
```

Expected: creates 9 missing `[Mimesis v0.2 gate] ...` issues or reports existing matches if they appeared in between.

- [ ] **Step 2: Refresh remote sync**

Run:

```bash
npm run owner:issue-remote-sync
npm run audit:owner-issue-remote-sync
```

Expected: `matchedGateCount: 9`, `missingGateCount: 0`, still with no proof or closure claim.

### Task 4: Wire And Verify

**Files:**
- Modify: `package.json`
- Modify: `bin/mimesis.mjs`
- Modify: `tools/audit-cli.mjs`
- Modify: `tools/validate-mimesis.mjs`
- Modify: manifest generators and audits
- Modify: README, tools README, STATUS, ROADMAP, completion audit, release packet, release order, status/roadmap audit
- Modify: `.mimesis/run_ledger.md`

- [ ] **Step 1: Wire scripts and CLI**

Add `owner:issue-remote-create` and `audit:owner-issue-remote-create`. Keep `owner:issue-remote-create` out of `release:check`; include only `audit:owner-issue-remote-create`.

- [ ] **Step 2: Regenerate manifests**

Run:

```bash
npm run framework:manifest
npm run release:artifact-manifest
```

- [ ] **Step 3: Full verification**

Run:

```bash
npm run audit:owner-issue-remote-create
npm run audit:owner-issue-remote-sync
npm run audit:release-order
npm run audit:status-roadmap
npm run audit:completion
npm run validate
npm run release:check
npm run audit:sync:strict
```

Expected: all pass. Completion remains open unless every other v0.2 gate has direct evidence.
