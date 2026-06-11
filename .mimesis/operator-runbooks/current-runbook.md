# Mimesis Operator Runbook

Generated from the current local repository state for Mimesis Engineering v0.1.0.

Status: local operator runbook, not external proof.

## 30-Second Orientation

Give AI standards, not roles.
Bring one weak artifact.
Use the ecosystem this way:

- `mimesis-engineering` defines the protocol and validates the artifact trail.
- `mimesis-canvas` helps shape fuzzy work before the full protocol.
- `mimesis-casebook` shows before/after case grammar and proof-boundary writing.

## Repository Roles

| Repository | Local Status | Role |
| --- | --- | --- |
| `mimesis-engineering` | framework hub | method, protocol, templates, packets, validators |
| `mimesis-canvas` | available locally | worksheet and 10-part canvas |
| `mimesis-casebook` | available locally | before/after cases and proof-boundary examples |

Source map:

| Repository | Role | What It Adds |
| --- | --- | --- |
| `svy04/mimesis-engineering` | Framework hub | method, protocol, templates, reference packs, adapters, proof boundary, validator |
| `svy04/mimesis-canvas` | Worksheet | 10-part canvas, Notion-ready structure, domain examples |
| `svy04/mimesis-casebook` | Case library | public cases with starting artifact, Mimesis lens, change, boundary, and next proof |

## 5-Minute First Loop

1. Read `README.md` for the 30-second frame.
2. Pick one weak artifact.
3. If the artifact is still fuzzy, use `mimesis-canvas` to fill the canvas.
4. Pick one reference pack from `reference-packs/`.
5. Run:

```bash
npm run cli -- case:start --artifact path/to/weak.md --reference-pack reference-packs/github-readme.md --title "First Loop"
```

6. Complete the generated `.mimesis` files.
7. Run:

```bash
npm run ecosystem:resources
npm run cli -- case:check path/to/case
npm run release:check:public
```

## First External Proof Loop

Generate the submitter kit:

```bash
npm run proof:intake
```

Then run the first permissioned or clearly redacted external weak artifact through:

Run the first permissioned proof loop in this order:

```bash
npm run cli -- proof:readiness
npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "Permissioned README Case"
npm run cli -- case:check path/to/started-case
npm run cli -- evidence:from-case path/to/started-case --out path/to/evidence-packet.md
npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
npm run cli -- benchmark:packet
npm run cli -- evidence:check path/to/reviewed-evidence.md --require-reviewed --write-report
npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md
npm run release:check:public
```

`case:check` should fail until the improved artifact, boundary check, case note, and run ledger are completed.

Use `mimesis-casebook` for case-note grammar only.
Do not treat casebook examples as proof that the new case is complete.

## Publication Readiness Loop

Before any public release, generate current handoffs:

```bash
npm run release:packet
npm run proof:packet
npm run license:packet
npm run plugin:packet
npm run publish:packet
npm run gate:board
npm run operator:runbook
npm run ecosystem:resources
npm run release:check:public
```

Strict publish readiness still requires:

```bash
npm run release:ready:publish
```

## Evidence Commands

- `npm run audit:ecosystem` checks neighboring local resources.
- `npm run ecosystem:resources` indexes local ecosystem resources without copying neighboring repository content.
- `npm run audit:remote` checks public repository visibility only.
- `npm run gate:board` summarizes current owner/proof/publication gates.
- `npm run proof:intake` creates the first external proof intake kit.
- `npm run case:review` checks permissioned intake.
- `npm run case:from-intake` creates a started external case workspace.
- `npm run case:check` checks completed local case evidence.
- `npm run evidence:check` checks strong-claim evidence packets.
- `npm run audit:sync:strict` requires a clean synced worktree before publish readiness.

## Current Gate Snapshot

# Mimesis Current Gate Board

Generated from the current local repository state for Mimesis Engineering v0.1.0.

Status: local gate board, not completion proof.

## Runtime Sync Gate

- authoritative check: `npm run audit:sync:strict`
- optional report file: `npm run audit:sync` writes `.mimesis/sync-status.md`
- committed gate board is not a sync proof
- runtime-only strict sync audit is required after the intended branch is clean and pushed
- this board intentionally avoids branch, commit hash, upstream head, and dirty-worktree snapshot lines

## Gate Table

| Gate | Current Status | Evidence | Next Action | Boundary |
| --- | --- | --- | --- | --- |
| v0.1 local framework preflight | ready locally | docs/COMPLETION-AUDIT.md, npm run release:check:public | Run release preflight after each public-surface edit. | Local coherence only; not external adoption or publication. |
| strict publish sync | requires runtime audit | npm run audit:sync:strict; optional report: npm run audit:sync | Run the runtime-only strict sync audit after the intended branch is clean and pushed. | The committed gate board is not a sync proof and does not stage, commit, push, tag, or release. |
| owner license decision | blocked by owner or external evidence | docs/LICENSE-DECISION.md, .mimesis/license-packets/owner-decision.md | Owner chooses license text before open-source reuse or npm publish claims. | No legal advice and no license choice is made by this board. |
| first permissioned external proof | blocked by owner or external evidence | docs/V0.2-PROOF-QUEUE.md, docs/PROOF-READINESS-PACKET.md, .mimesis/proof-runs/readiness.md, templates/permissioned-case-intake.md | Run proof:readiness, collect one permissioned or clearly redacted weak artifact, then run the full proof path. | No v0.2 external proof claim until case:review, case:from-intake, case:check, evidence:check, and public preflight pass. |
| package publication | blocked by owner or external evidence | docs/PACKAGE-RELEASE-CANDIDATE.md, npm run audit:package | Owner chooses license, then publish from owner-controlled npm account if desired. | Dry-run package surface only; not npm publication. |
| action publication | blocked by owner or external evidence | docs/ACTION-RELEASE-CANDIDATE.md, npm run audit:action | Create tag/release or Marketplace listing only after owner publication decision. | Repository-local action candidate only; not Marketplace publication. |
| shipped plugin claim | blocked by owner or external evidence | docs/PLUGIN-RELEASE-PACKET.md, .mimesis/plugin-release-packets/v0.1-action-candidate.md | Produce a real tagged plugin/action release and evidence packet before shipped-plugin claims. | Release-candidate handoff only; not a shipped plugin. |
| benchmark or adoption claim | blocked by owner or external evidence | docs/COMPLETION-AUDIT.md, docs/BENCHMARK-PACKET.md, .mimesis/benchmark-packets/v0.2-first-benchmark.md, templates/evidence-packet.md | Use the benchmark packet, then create a reviewed evidence packet from a real measurement or adoption event. | Measurement protocol only; no broad productivity, customer outcome, or adoption claim without direct evidence. |

## Allowed Claim

The repository has a local gate board that summarizes remaining owner, proof, sync, package, action, plugin, benchmark, and adoption gates.

## Disallowed Claim

This board does not prove that the framework is externally adopted, benchmarked, legally licensed for reuse, published to npm, published as a GitHub Marketplace action, shipped as a plugin, remotely fresh, synced to upstream, or production-ready.

## Boundary

This gate board does not choose a license, create external proof, run a transformation, stage files, create a commit, push, tag, create a pull request, publish to npm, publish a GitHub Marketplace action, prove remote freshness, close the runtime-only strict sync audit, prove benchmarked productivity, or prove external adoption.

Source boundaries:

- # Publish Sync Gate
- # v0.2 Proof Queue
- # License Decision Packet
- # Benchmark Packet


## Stop Conditions

Do not publish a stronger claim if:

- `npm run release:check` fails
- `npm run audit:activation` fails or the README no longer preserves the first-action path
- `npm run audit:first-loop` fails or the first-loop demo is described as external proof
- `npm run audit:framework-manifest-schema` fails or the schema is described as external adoption, package publication, shipped plugin, official host compliance, customer outcome, or legal originality proof
- `npm run audit:framework-manifest` fails or the framework manifest is described as external adoption, benchmark, package publication, shipped plugin, customer outcome, or legal originality proof
- `npm run audit:reference-index` fails or the reference index is described as source-quality proof by itself, adoption proof, package publication, or permission to copy protected surface
- `npm run audit:release-order` fails or generated/report commands are moved after dependent checks
- the license boundary is unclear
- a case contains copied protected material
- a case lacks a proof boundary
- adapter or plugin status is inflated beyond evidence
- package or action release-candidate status is described as actual publication
- Codex plugin scaffold is described as a shipped plugin, Marketplace listing, installed plugin, or external adoption proof
- MCP server scaffold or stdio runtime candidate is described as a shipped MCP server, connector installation, long-running service, secret exposure, official host compliance proof, external adoption proof, or a command-executing tool server
- plugin/action release-candidate packet is described as a shipped plugin
- remote visibility is described as remote content freshness or adoption
- remote fallback visibility is described as remote content freshness or adoption
- sync status is described as commit, push, tag, or publication
- publish handoff packet is described as commit, push, tag, release, remote freshness, or publication
- release execution packet is described as commit, push, tag, release, package publication, Marketplace publication, or license choice
- publication evidence packet is described as publication proof, npm publication, Marketplace publication, plugin shipment, tag creation, commit, push, or gate closure
- goal completion audit is described as completion proof, closed gates, publication, owner decision, external proof, benchmark proof, or adoption proof
- current state summary is described as closed gates, completion proof, publication, owner decision, external proof, adoption proof, or benchmark evidence
- worktree review packet is described as publication, remote freshness proof, strict sync closure, commit, push, tag, release, owner decision, external proof, or adoption evidence
- release review bundle is described as commit, push, tag, release, publication, license choice, remote freshness proof, strict sync closure, owner decision, external proof, or adoption evidence
- owner proof handoff is described as license choice, permission grant, submitted artifact, proof approval, external proof, publication, adoption proof, or closed gate
- release artifact manifest is described as publication, sync, license choice, external proof, legal originality proof, or adoption evidence
- status roadmap sync is described as completion proof, publication, owner decision, external proof, legal originality proof, or adoption evidence
- public claim pack is described as publication, adoption proof, benchmark proof, legal proof, or certification
- permissioned intake review is described as completed external proof
- permissioned case fixture is described as a real submitter artifact or external proof
- started case from intake is described as completed before/after proof
- started case from record is described as completed before/after proof, real external proof, adoption proof, or publication
- case publication packet is described as publication, permission grant, adoption proof, benchmark proof, or license decision
- strong public claims are made without an evidence packet
- secret safety scan is described as production-grade security proof or complete private-data detection
- gate-board rows are described as completed owner decisions, external proof, publication, benchmark, or adoption
- gap register is described as completion proof, publication, owner decision, external proof, adoption proof, or closed gates
- gap closure plan is described as completion proof, publication, owner decision, external proof, adoption proof, or closed gates
- gate evidence packet is described as evidence, completion proof, publication, owner decision, external proof, adoption proof, or closed gates
- gate closure readiness is described as evidence, submitted evidence, attached evidence, completion proof, publication, owner decision, external proof, adoption proof, or closed gates
- owner evidence submission check is described as submitted evidence, attached evidence, gate movement, completion proof, publication, owner decision, external proof, adoption proof, or closed gates
- operator runbook is described as external adoption, publication, or proof that neighboring repos are current
- not allowed: ecosystem resource packet is described as copied neighboring content, external adoption, publication, or remote freshness proof
- the v0.2 proof queue is described as completed external proof
- the first-proof packet is described as a completed external case
- the proof-intake kit is described as a submitted artifact or completed external proof
- the proof intake fixture record is described as a real submitter artifact, permission grant, completed external proof, adoption proof, or publication
- the proof intake check is described as permission, completed external proof, private-data removal proof, adoption proof, or publication
- the proof intake schema is described as permission, completed external proof, adoption proof, or publication
- the proof-run packet is described as completed external proof, adoption proof, or publication
- the proof-run dry audit is described as a real external case, external proof, or release preflight execution
- the license packet is described as an actual license decision
- the benchmark packet is described as measured productivity, adoption proof, customer outcome proof, or commercial impact
- the adoption packet is described as external adoption proof, evidence creation, publication, or gate closure
- a public sentence implies endorsement, adoption, benchmark, or customer outcome proof without evidence

Additional operator stop conditions:

- Do not publish a case without permission, redaction, and proof boundary.
- Do not describe `mimesis-canvas` or `mimesis-casebook` as external adoption proof.
- Do not describe the ecosystem resource packet as copied neighboring repository content.
- Do not describe local packet generation as publication.
- Do not describe remote visibility as remote freshness.

## Remaining Gates

1. Owner chooses a license.
2. A real permissioned or clearly redacted external weak artifact goes through the loop.
3. A plugin or action is packaged as a tagged public release.
4. Any productivity or adoption claim gets its own evidence packet before entering public copy.

## Boundary

This runbook does not prove external adoption, does not choose a license, does not create external proof, does not publish to npm, does not publish a GitHub Marketplace action, does not tag a release, and does not push commits.
It is a local operating path through the current repo resources.
It does not copy neighboring repository content.
