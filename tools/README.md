# Tools

This folder contains local checks for the Mimesis repository.

## Validate Mimesis

Run:

```bash
npm run validate
```

or:

```bash
node tools/validate-mimesis.mjs
```

or:

```bash
npm run cli -- validate
```

The validator checks:

- required framework files
- README section order
- core Mimesis phrases
- `.mimesis` placeholder completion
- adapter and plugin status labels
- GitHub issue form shape
- local Markdown links
- risky maturity / proof phrases with nearby boundary context
- case files with change and boundary signals

## Check A Workspace

Run:

```bash
npm run workspace:check
```

or:

```bash
npm run cli -- workspace:check path/to/project
```

This checks a target repository's `.mimesis` protocol trail.
It is intended for completed artifact loops, not empty templates.

Boundary:
This proves only visible local `.mimesis` file-protocol evidence.
It does not prove external outcomes, originality, or adoption.

## Create First-Loop Demo

Run:

```bash
npm run first-loop:demo
```

or:

```bash
npm run cli -- first-loop:demo
```

This writes `.mimesis/first-loop-demo/` from `examples/weak-readme.md`.
The demo is a completed local case workspace for the 5-minute first loop.
It does not prove external adoption, benchmarked productivity, customer outcomes, legal originality, package publication, or a real permissioned external case.

## Audit First-Loop Demo

Run:

```bash
npm run audit:first-loop
```

or:

```bash
npm run cli -- audit:first-loop
```

This regenerates the demo, runs `workspace:check .mimesis/first-loop-demo`, runs `case:check .mimesis/first-loop-demo --write-report`, and verifies before/after plus proof-boundary evidence.

## Create Framework Manifest

Run:

```bash
npm run framework:manifest
```

or:

```bash
npm run cli -- framework:manifest
```

This writes `.mimesis/framework-manifest.json`.
It is an AI-native index of Mimesis entrypoints, commands, artifact groups, gates, and proof boundaries.
It does not prove external adoption, benchmarked productivity, package publication, shipped plugins, customer outcomes, or legal originality.

## Audit Framework Manifest Schema

Run:

```bash
npm run audit:framework-manifest-schema
```

or:

```bash
npm run cli -- audit:framework-manifest-schema
```

This checks `spec/framework-manifest.schema.json` and validates `.mimesis/framework-manifest.json` against the local schema subset.
It does not prove external adoption, package publication, shipped plugin proof, official host compliance, customer outcomes, or legal originality.

## Audit Spec Index

Run:

```bash
npm run audit:spec-index
```

or:

```bash
npm run cli -- audit:spec-index
```

This checks `spec/README.md`, the local JSON Schema list, package script wiring, CLI exposure, release preflight wiring, validator coverage, and public documentation visibility.
It does not prove external adoption, submit evidence, choose a license, publish, or close owner/proof gates.

## Create Reference Pack Index

Run:

```bash
npm run reference:index
```

or:

```bash
npm run cli -- reference:index
```

This writes `.mimesis/reference-packs/index.json`.
It indexes source-first standards from `reference-packs/`.
It does not prove source quality by itself, external adoption, package publication, or permission to copy protected surface.

## Audit Reference Pack Index

Run:

```bash
npm run audit:reference-index
```

or:

```bash
npm run cli -- audit:reference-index
```

This checks generated index freshness, all seven starter packs, source-quality fields, inspection fields, transferable patterns, what-not-to-copy boundaries, starter prompts, package scripts, CLI exposure, and release preflight wiring.

## Create And Audit Superpowers Adapter

Run:

```bash
npm run adapter:superpowers
npm run audit:superpowers-adapter
```

or:

```bash
npm run cli -- adapter:superpowers
npm run cli -- audit:superpowers-adapter
```

This writes `.mimesis/adapter-packets/superpowers.md`.
It is a local process/artifact contract for using Superpowers discipline with Mimesis standards.
It does not install Superpowers, prove that a Superpowers skill ran, prove external adoption, publish a package, or ship a plugin.

## Audit Framework Manifest

Run:

```bash
npm run audit:framework-manifest
```

or:

```bash
npm run cli -- audit:framework-manifest
```

This checks the generated manifest, stale-output detection, package script, CLI command, release preflight hook, docs, schema audit hook, core phrases, artifact groups, gates, and proof boundaries.
It does not prove package publication or external adoption.

## Start A Case

Run:

```bash
npm run case:start -- --artifact path/to/weak.md --reference-pack reference-packs/github-readme.md --title "Weak README"
```

or:

```bash
npm run cli -- case:start --artifact path/to/weak.md --reference-pack reference-packs/github-readme.md --title "Weak README"
```

This creates a started case workspace with the `.mimesis` protocol files and a copied weak artifact.
It does not create a completed proof artifact.

## Audit Case Start

Run:

```bash
npm run audit:case-start
```

This smoke-tests `case:start` in a temporary directory and verifies that `workspace:check` does not misclassify a newly started case as complete.

## Check A Case

Run:

```bash
npm run case:check
```

or:

```bash
npm run cli -- case:check path/to/case
```

This checks a filled case workspace for before/after evidence, reference notes, improved artifact content, proof boundary, and run ledger evidence.
It does not prove external adoption, benchmarked outcomes, or legal originality.

To write a local proof report:

```bash
npm run cli -- case:check path/to/case --write-report
```

## Audit Case Check

Run:

```bash
npm run audit:case-check
```

This verifies that started cases fail and completed local-evidence cases pass.

## Create Case Publication Packet

Run:

```bash
npm run case:publish-packet
```

or:

```bash
npm run cli -- case:publish-packet path/to/case
```

This writes `.mimesis/case-publication-packets/current-casebook-candidate.md` after `case:check --write-report` passes.
It is a local casebook candidate packet, not publication, permission, external adoption proof, benchmark proof, or a license decision.

## Audit Case Publication Packet

Run:

```bash
npm run audit:case-publication
```

This checks that the generated case publication packet includes the case-check result, casebook shape, evidence to copy, publication checklist, allowed claim, disallowed claim, and proof boundary.

## Review Permissioned Case Intake

Run:

```bash
npm run cli -- case:review path/to/permissioned-case.md
```

Require public, anonymized, or redacted publication readiness:

```bash
npm run cli -- case:review path/to/permissioned-case.md --require-public
```

This checks permission, publication preference, redaction requirements, safety confirmation, and proof boundary.
It does not prove the transformation has been completed.

## Audit Permissioned Case Review

Run:

```bash
npm run audit:permissioned-case
```

This smoke-tests public, private-only, and unsafe intake paths.

## Audit Permissioned Case Fixture

Run:

```bash
npm run audit:permissioned-fixture
```

This checks the fillable intake template, the reviewable local fixture in `examples/permissioned-case-intake.md`, and the generated review report boundary.
It does not create external proof and is not a real submitter artifact.

## Start Case From Permissioned Intake

Run:

```bash
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "External README Case"
```

This runs `case:review --require-public`, preserves the intake, and creates a started case workspace.
It does not create completed before/after proof.

## Start Case From Proof Intake Record

Run:

```bash
npm run cli -- case:from-record .mimesis/proof-intake/fixture-record.json --title "Record Case"
```

This reads a schema-shaped proof intake record, preserves it as `proof-intake-record.json`, extracts the weak artifact, and creates a started case workspace.
It does not create completed before/after proof, external adoption proof, or publication.

## Audit Case From Record

Run:

```bash
npm run audit:case-from-record
```

This smoke-tests the proof-intake-record to started-case path and verifies the generated workspace still fails `case:check` until transformed.

## Audit Case From Intake

Run:

```bash
npm run audit:case-from-intake
```

This verifies that reviewed intake becomes a started external case workspace and still fails `case:check` until transformed.

## Check Evidence Packet

Run:

```bash
npm run cli -- evidence:check path/to/evidence-packet.md
```

Require a reviewed or publishable decision:

```bash
npm run cli -- evidence:check path/to/evidence-packet.md --require-reviewed
```

This checks whether a strong claim has an evidence type, source links, permission/publication boundary, measurement method, event evidence, allowed claim, disallowed claim, and remaining proof gap.
It does not create evidence or prove external adoption beyond the named artifacts.

## Create Gate Board

Run:

```bash
npm run gate:board
```

or:

```bash
npm run cli -- gate:board
```

This writes `.mimesis/gates/current-gateboard.md`.
It summarizes owner, proof, sync, package, action, plugin, benchmark, and adoption gates.
It does not choose a license, create external proof, publish, or prove adoption.

## Create Gap Register

Run:

```bash
npm run gap:register
```

or:

```bash
npm run cli -- gap:register
```

This writes `.mimesis/gaps/current-gap-register.json`.
It is a machine-readable register of remaining owner, proof, publication, benchmark, and adoption gaps.
The strict sync gap stays visible in committed gap-register snapshots because current sync proof is runtime-only.
It does not prove completion, publish, choose a license, create external proof, or prove adoption.

## Audit Gap Register

Run:

```bash
npm run audit:gap-register
```

or:

```bash
npm run cli -- audit:gap-register
```

This checks required gap IDs, required evidence fields, source files, package script wiring, CLI exposure, release preflight hook, and proof boundaries.

## Audit Gap Register Sync Closure

Run:

```bash
npm run audit:gap-register-sync-closure
```

or:

```bash
npm run cli -- audit:gap-register-sync-closure
```

This checks that the strict sync gap stays visible in committed artifacts, and that current sync proof remains a runtime-only non-writing strict sync check through `npm run audit:sync:strict`.

## Create Gap Closure Plan

Run:

```bash
npm run gap:closure-plan
```

or:

```bash
npm run cli -- gap:closure-plan
```

This writes `.mimesis/gaps/closure-plan.json`.
It turns the current gap register into evidence steps, commands, stop conditions, and allowed post-closure claims.
It does not close gates, prove completion, publish, choose a license, create external proof, or prove adoption.

## Audit Gap Closure Plan

Run:

```bash
npm run audit:gap-closure-plan
```

or:

```bash
npm run cli -- audit:gap-closure-plan
```

This checks the generated gap closure plan, required open-gate IDs, closure commands, stop conditions, package script wiring, CLI exposure, release preflight hook, release artifact manifest visibility, and proof boundaries.

## Create Gate Evidence Packet

Run:

```bash
npm run gate:evidence-packet
```

or:

```bash
npm run cli -- gate:evidence-packet
```

This writes `.mimesis/gates/evidence-packet.md`.
It routes open gates to evidence packet requirements, review commands, and stop conditions.
It does not close gates, create evidence, prove completion, publish, choose a license, create external proof, or prove adoption.

## Audit Gate Evidence Packet

Run:

```bash
npm run audit:gate-evidence-packet
```

or:

```bash
npm run cli -- audit:gate-evidence-packet
```

This checks the generated gate evidence packet, required open-gate IDs, evidence template bridge, review command path, package script wiring, CLI exposure, release preflight hook, release artifact manifest visibility, and proof boundaries.

## Create Gate Closure Readiness

Run:

```bash
npm run gate:closure-readiness
```

or:

```bash
npm run cli -- gate:closure-readiness
```

This writes `.mimesis/gates/closure-readiness.json`.
It turns the current gap register, closure plan, owner evidence submission record, and current state summary into a readiness report with `canCloseNow: false` for current open gates.
It also supports candidate input from a real owner evidence submission record:

```bash
npm run cli -- gate:closure-readiness --owner-evidence-submission path/to/reviewed-owner-evidence-submission.json --output path/to/closure-readiness-candidate.json
```

Candidate mode can set `ownerEvidenceReviewReady: true` for reviewed submitted owner evidence fields, while keeping `canCloseNow: false`.
It does not close gates, create evidence, attach evidence, submit evidence, prove completion, publish, choose a license, create external proof, or prove adoption.

## Audit Gate Closure Readiness

Run:

```bash
npm run audit:gate-closure-readiness
```

or:

```bash
npm run cli -- audit:gate-closure-readiness
```

This checks package script wiring, CLI exposure, release preflight order, generated readiness source coverage, candidate owner evidence submission input, required open-gate IDs, `ownerEvidenceReviewReady`, `canCloseNow` boundaries, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-evidence/no-closure claims.

## Create Gate Closure Review

Run:

```bash
npm run gate:closure-review
```

or:

```bash
npm run cli -- gate:closure-review
```

This writes `.mimesis/gates/closure-review.json`.
It turns the gate closure readiness report and owner evidence submission check into a review record with `decision: keep_open` and `closureApproved: false`.
It also supports candidate input from a real readiness/check/record set:

```bash
npm run cli -- gate:closure-review --readiness path/to/closure-readiness-candidate.json --owner-evidence-submission-check path/to/owner-evidence-field-check.md --owner-evidence-submission path/to/reviewed-owner-evidence-submission.json --output path/to/closure-review-candidate.json
```

Candidate review can carry `ownerEvidenceReviewReady: true` forward while keeping `decision: keep_open`, `closureApproved: false`, and `canCloseNow: false`.
It does not approve gate closure, close gates, create evidence, attach evidence, submit evidence, prove completion, publish, choose a license, create external proof, or prove adoption.

## Audit Gate Closure Review

Run:

```bash
npm run audit:gate-closure-review
```

or:

```bash
npm run cli -- audit:gate-closure-review
```

This checks package script wiring, CLI exposure, release preflight order, generated review source coverage, required open-gate IDs, `keep_open` decisions, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-approval/no-closure claims.

## Audit Gate Board

Run:

```bash
npm run audit:gateboard
```

This checks that the generated gate board names each remaining gate and keeps the allowed/disallowed claim boundary visible.

## Audit Evidence Packet

Run:

```bash
npm run audit:evidence
```

This smoke-tests reviewed, draft, and unsafe evidence packet paths.

## Create Evidence From Case

Run:

```bash
npm run evidence:from-case
```

or:

```bash
npm run cli -- evidence:from-case . --out .mimesis/evidence-packets/local-case-draft.md --force
```

This creates a draft evidence packet from a completed local case workspace after `case:check` passes.
It does not mark the evidence as reviewed and does not prove external adoption.

## Audit Evidence From Case

Run:

```bash
npm run audit:evidence-from-case
```

This checks that completed case evidence can create a draft evidence packet, that started cases are rejected, and that `evidence:check --require-reviewed` stays closed for the draft.

## Review Evidence Packet

Run:

```bash
npm run cli -- evidence:review .mimesis/evidence-packets/local-case-draft.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
```

This records a named reviewer decision on a structurally valid evidence packet.
It does not create evidence and does not prove external adoption.

## Audit Evidence Review

Run:

```bash
npm run audit:evidence-review
```

This checks reviewed, rejected, and missing-reviewer decision paths without reviewing the repository's draft evidence packet.

## Create Claim From Evidence

Run:

```bash
npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md
```

This creates a bounded claim candidate from a reviewed evidence packet.
It does not create evidence and does not publish.

## Audit Claim From Evidence

Run:

```bash
npm run audit:claim-from-evidence
```

This checks that reviewed evidence can produce a bounded claim candidate and that draft evidence is rejected.

## Audit v0.2 Proof Queue

Run:

```bash
npm run audit:proof-queue
```

This checks that the first permissioned external proof loop has an explicit queue, command path, stop conditions, and no hidden v0.2 completion claim.

## Create First Proof Intake Kit

Run:

```bash
npm run proof:intake
```

or:

```bash
npm run cli -- proof:intake
```

This writes `.mimesis/proof-intake/first-external-proof-kit.md`.
It gives a submitter the fields, permission/redaction boundary, command path, and evidence requirements for the first permissioned external weak artifact.
It does not create external proof or prove adoption.

## Audit First Proof Intake Kit

Run:

```bash
npm run audit:proof-intake
```

This checks that the generated intake kit includes submitter fields, required command path, evidence packet requirements, stop conditions, and proof boundaries.

## Create Proof Intake Record

Run:

```bash
npm run proof:intake-record
```

or:

```bash
npm run cli -- proof:intake-record
```

This writes `.mimesis/proof-intake/fixture-record.json` from `examples/permissioned-case-intake.md`.
It is a schema-shaped local fixture record, not a real submitter artifact, permission grant, external proof, or publication.

## Audit Proof Intake Record

Run:

```bash
npm run audit:proof-intake-record
```

or:

```bash
npm run cli -- audit:proof-intake-record
```

This checks freshness, schema conformance, safety confirmations, prohibited claims, package script wiring, CLI exposure, release preflight wiring, and documentation boundaries.

## Check Proof Intake Record

Run:

```bash
npm run proof:intake-check
```

or:

```bash
npm run cli -- proof:intake-check .mimesis/proof-intake/fixture-record.json --require-case-ready --write-report .mimesis/proof-intake/fixture-check.md
```

This checks a schema-shaped proof intake record before `case:from-record`.
It writes `.mimesis/proof-intake/fixture-check.md` for the local fixture path.
It does not create external proof, does not grant permission, does not redact files, does not publish, and does not prove adoption.

## Proof Intake From Owner Evidence

Run the default blocked bridge report:

```bash
npm run proof:intake-from-owner-evidence
```

or:

```bash
npm run cli -- proof:intake-from-owner-evidence
```

This writes `.mimesis/proof-intake/from-owner-evidence-bridge.md`.

After the owner supplies a reviewed owner evidence submission record with `weak_artifact_permission` submitted, convert that field into a proof intake record:

```bash
npm run cli -- proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json --submitter "owner-reviewed weak artifact" --artifact-owner "owner-confirmed artifact owner" --permission-status "owner permits redacted framework review only" --publication-preference redacted --redaction-requirements "redact private details before public use" --reference reference-packs/github-readme.md --desired-transformation "Transform one weak artifact under Mimesis boundaries." --confirm-no-secrets --confirm-no-private-customer-data --confirm-no-copied-protected-material
```

This bridge reads the owner evidence submission record and writes a schema-shaped proof intake record for `proof:intake-check` and `case:from-record`.
It does not grant permission, create external proof, publish, or close gates.

## Audit Proof Intake From Owner Evidence

Run:

```bash
npm run audit:proof-intake-from-owner-evidence
```

or:

```bash
npm run cli -- audit:proof-intake-from-owner-evidence
```

This checks blocked fixture behavior, reviewed-field conversion, explicit safety confirmations, proof intake checking, started-case creation, and the no-proof/no-permission/no-closure boundary.

## Audit Proof Intake Check

Run:

```bash
npm run audit:proof-intake-check
```

or:

```bash
npm run cli -- audit:proof-intake-check
```

This checks the proof intake check command, generated report, unsafe-record failure behavior, package script wiring, CLI exposure, release preflight ordering, public docs, completion matrix visibility, framework manifest visibility, release artifact manifest coverage, and no-proof/no-permission boundaries.

## Create Proof Redaction Packet

Run:

```bash
npm run proof:redaction-packet
```

or:

```bash
npm run cli -- proof:redaction-packet
```

This writes `.mimesis/proof-intake/redaction-packet.md`.
It is a proof redaction packet for checking secrets, tokens, passwords, private customer data, copied protected material, publication preference, and redaction requirements before `case:review`.
It does not redact files, create external proof, grant permission, publish, choose a license, or guarantee complete private-data removal.

## Audit Proof Redaction Packet

Run:

```bash
npm run audit:proof-redaction-packet
```

or:

```bash
npm run cli -- audit:proof-redaction-packet
```

This checks the generated redaction checklist packet, package script wiring, CLI exposure, release preflight order, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and proof boundaries.

## Create Proof Submission Packet

Run:

```bash
npm run proof:submission-packet
```

or:

```bash
npm run cli -- proof:submission-packet
```

This writes `.mimesis/proof-intake/submission-packet.md`.
It is a proof submission packet that connects the GitHub issue form, permissioned intake template, proof intake kit, proof redaction packet, and operator command path before `case:review`.
It does not submit an artifact, create external proof, grant permission, publish, choose a license, or close the external-artifact gate.

## Audit Proof Submission Packet

Run:

```bash
npm run audit:proof-submission-packet
```

or:

```bash
npm run cli -- audit:proof-submission-packet
```

This checks the generated submission handoff, GitHub issue form references, required fields, package script wiring, CLI exposure, release preflight order, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and proof boundaries.

## Create Proof Acceptance Packet

Run:

```bash
npm run proof:acceptance-packet
```

or:

```bash
npm run cli -- proof:acceptance-packet
```

This writes `.mimesis/proof-intake/acceptance-packet.md`.
It is a proof acceptance packet that gives an accept / revise / reject case creation gate after submission and before `case:from-intake`.
It does not accept an artifact, create external proof, grant permission, run a transformation, publish, choose a license, or close the external-artifact gate.

## Audit Proof Acceptance Packet

Run:

```bash
npm run audit:proof-acceptance-packet
```

or:

```bash
npm run cli -- audit:proof-acceptance-packet
```

This checks the generated acceptance gate, acceptance states, command path, package script wiring, CLI exposure, release preflight order, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and proof boundaries.

## Audit Proof Intake Schema

Run:

```bash
npm run audit:proof-intake-schema
```

or:

```bash
npm run cli -- audit:proof-intake-schema
```

This checks `spec/proof-intake.schema.json`, package script wiring, CLI exposure, release preflight wiring, and proof-intake schema docs.
It does not create external proof, grant permission, prove adoption, choose a license, or publish a case.

## Create Proof Readiness Packet

Run:

```bash
npm run proof:readiness
```

or:

```bash
npm run cli -- proof:readiness
```

This writes `.mimesis/proof-runs/readiness.md`.
It is a first weak artifact readiness packet, not a submitted artifact, permission grant, owner decision, external proof, publication, adoption proof, or owner gate bypass.

## Audit Proof Readiness Packet

Run:

```bash
npm run audit:proof-readiness
```

or:

```bash
npm run cli -- audit:proof-readiness
```

This checks readiness state, local prepared surfaces, blocked gates, intake card, operator command path, claim boundary, next action, and proof-boundary text.

## Create First Proof Candidate Packet

Run:

```bash
npm run proof:candidate-packet
```

or:

```bash
npm run cli -- proof:candidate-packet
```

This writes `.mimesis/proof-candidates/first-candidate.md`.
It is a first proof candidate packet for selecting one permissioned or clearly redacted weak artifact.
It does not create external proof, select a candidate, grant permission, publish, choose a license, or prove adoption.

## Audit First Proof Candidate Packet

Run:

```bash
npm run audit:proof-candidate-packet
```

or:

```bash
npm run cli -- audit:proof-candidate-packet
```

This checks the generated candidate selection packet, required command path, package script wiring, CLI exposure, release preflight ordering, completion matrix visibility, release artifact manifest visibility, and no-proof boundary.

## Create Proof Run Packet

Run:

```bash
npm run proof:run-packet
```

or:

```bash
npm run cli -- proof:run-packet
```

This writes `.mimesis/proof-runs/v0.2-first-run.md`.
It is an operator proof-run handoff, not external proof, publication, adoption proof, or customer outcome proof.

## Create Proof Execution Report

Run:

```bash
npm run proof:execution-report
```

or:

```bash
npm run cli -- proof:execution-report
```

This writes `.mimesis/proof-runs/execution-report.md`.
It is a proof execution report and command evidence ledger for a future real proof run.
It does not execute commands, create external proof, run a transformation, publish, choose a license, or prove adoption.

After a real operator run, generate a separate candidate execution review from a proof execution record:

```bash
npm run cli -- proof:execution-report --execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md
```

The `--execution-record` file follows `spec/proof-execution-record.schema.json`.
The `--output` report can mark `candidateEvidenceReviewReady: true`, but it still keeps `proofApproved: false`, `publicClaimApproved: false`, and `completionAllowed: false`.

## Audit Proof Execution Report

Run:

```bash
npm run audit:proof-execution-report
```

or:

```bash
npm run cli -- audit:proof-execution-report
```

This checks the generated proof execution report, proof execution record schema, candidate execution review mode, execution states, command evidence ledger, required attachments, package script wiring, CLI exposure, release preflight order, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and proof boundaries.

## Audit Proof Run Packet

Run:

```bash
npm run audit:proof-run
```

This checks that the generated proof-run packet includes inputs, operator command path, evidence board, stop conditions, allowed claim, disallowed claim, and proof boundary.

## Audit Proof Run Dry Path

Run:

```bash
npm run audit:proof-run-dry
```

or:

```bash
npm run cli -- audit:proof-run-dry
```

This runs temporary local fixtures through both the permissioned-intake lane and the owner-evidence bridge lane, including started case creation, started-case rejection, completed case check, reviewed evidence packet, and bounded claim candidate.
It writes `.mimesis/proof-runs/dry-run-report.md`.
It does not create external proof and does not run `release:check:public`.

## Create First Proof Packet

Run:

```bash
npm run proof:packet
```

or:

```bash
npm run cli -- proof:packet
```

This writes `.mimesis/proof-packets/v0.2-first-proof.md`.
It is a handoff packet, not completed external proof.

## Audit First Proof Packet

Run:

```bash
npm run audit:proof-packet
```

This checks that the generated first-proof packet contains the required command path, submitter checklist, evidence checklist, stop conditions, and proof boundary.

## Create License Packet

Run:

```bash
npm run license:packet
```

or:

```bash
npm run cli -- license:packet
```

This writes `.mimesis/license-packets/owner-decision.md`.
It is an owner decision aid, not a license choice or legal advice.

## License Decision From Owner Answer

Run the default blocked bridge report:

```bash
npm run license:decision-from-owner-answer
```

or:

```bash
npm run cli -- license:decision-from-owner-answer
```

This writes `.mimesis/release-decisions/from-owner-answer-bridge.md`.

After the owner supplies a reviewed owner decision answer record with `license_or_no_reuse` answered, create a bounded release decision record candidate:

```bash
npm run cli -- license:decision-from-owner-answer path/to/owner-answer-record.json --output path/to/release-decision-record.json --decision no_reuse_boundary --owner-confirmation "Owner explicitly chose the no-reuse boundary for v0.1." --decision-evidence path/to/reviewed-owner-answer.json --confirm-owner-reviewed --confirm-not-legal-advice --confirm-no-publication
```

This bridge reads a reviewed owner answer and records owner-provided license/no-reuse intent.
It does not provide legal advice, publish, create external proof, or close gates.

## Audit License Decision From Owner Answer

Run:

```bash
npm run audit:license-decision-from-owner-answer
```

or:

```bash
npm run cli -- audit:license-decision-from-owner-answer
```

This checks blocked default behavior, reviewed owner answer conversion, required confirmations, no-legal-advice boundaries, release preflight wiring, validator coverage, framework manifest visibility, and release artifact manifest coverage.

## Audit License Packet

Run:

```bash
npm run audit:license-packet
```

This checks that the generated license packet keeps the `UNLICENSED`, `private`, owner-decision, and no-legal-advice boundaries visible.

## Create Operator Runbook

Run:

```bash
npm run operator:runbook
```

or:

```bash
npm run cli -- operator:runbook
```

This writes `.mimesis/operator-runbooks/current-runbook.md`.
It gives an operator a local run path through `mimesis-engineering`, `mimesis-canvas`, and `mimesis-casebook`.
It does not prove external adoption or publication.

## Audit Operator Runbook

Run:

```bash
npm run audit:operator-runbook
```

This checks that the generated runbook names the ecosystem roles, command loops, stop conditions, and proof boundaries.

## Create Ecosystem Resource Packet

Run:

```bash
npm run ecosystem:resources
```

or:

```bash
npm run cli -- ecosystem:resources
```

This writes `.mimesis/ecosystem-resources/current-resource-packet.md`.
It indexes local `mimesis-engineering`, `mimesis-canvas`, and `mimesis-casebook` resources by path and recommended use.
It does not copy neighboring repository content, prove external adoption, publish, or prove remote freshness.

## Audit Ecosystem Resource Packet

Run:

```bash
npm run audit:ecosystem-resources
```

This checks that the generated resource packet names canvas resources, casebook resources, recommended use, allowed claim, disallowed claim, and the no-copy/no-adoption boundary.

## Create Benchmark Packet

Run:

```bash
npm run benchmark:packet
```

or:

```bash
npm run cli -- benchmark:packet
```

This writes `.mimesis/benchmark-packets/v0.2-first-benchmark.md`.
It is a local measurement protocol, not benchmarked productivity proof, external adoption proof, customer outcome proof, or commercial impact.

## Audit Benchmark Packet

Run:

```bash
npm run audit:benchmark-packet
```

This checks that the generated benchmark packet includes the claim under test, measurement design, required evidence, adoption evidence, evidence packet path, allowed claim, disallowed claim, and proof boundary.

## Create Adoption Packet

Run:

```bash
npm run adoption:packet
```

or:

```bash
npm run cli -- adoption:packet
```

This writes `.mimesis/adoption-packets/v0.2-first-adoption.md` from `docs/ADOPTION-PACKET.md`.
It is external adoption evidence intake, not adoption proof, and it does not create evidence, publish, or close gates.

## Audit Adoption Packet

Run:

```bash
npm run audit:adoption-packet
```

or:

```bash
npm run cli -- audit:adoption-packet
```

This checks package script wiring, CLI exposure, release preflight order, generated packet sections, public docs, framework manifest visibility, release artifact manifest coverage, validator coverage, and the no-adoption-proof boundary.

## Create Plugin Install Packet

Run:

```bash
npm run plugin:install-packet
```

or:

```bash
npm run cli -- plugin:install-packet
```

This writes `.mimesis/plugin-install-packets/codex-local.md`.
It is a local Codex plugin install-readiness handoff, not installation proof, a shipped plugin, Marketplace listing, official host compliance proof, or external adoption proof.

## Audit Plugin Install Packet

Run:

```bash
npm run audit:plugin-install-packet
```

or:

```bash
npm run cli -- audit:plugin-install-packet
```

This checks the local Codex plugin install candidate, manual install boundary, rollback notes, allowed claim, disallowed claim, and not-installed proof boundary.

## Create Plugin Release Packet

Run:

```bash
npm run plugin:packet
```

or:

```bash
npm run cli -- plugin:packet
```

This writes `.mimesis/plugin-release-packets/v0.1-action-candidate.md`.
It is a release-candidate handoff, not a shipped plugin or Marketplace release.

## Audit Plugin Release Packet

Run:

```bash
npm run audit:plugin-packet
```

This checks that the generated plugin/action packet keeps the tag, Marketplace, shipped-plugin, external-integration, and adoption boundaries visible.

## Create Publish Handoff Packet

Run:

```bash
npm run publish:packet
```

or:

```bash
npm run cli -- publish:packet
```

This writes `.mimesis/publish-packets/local-sync-handoff.md`.
It is a local sync handoff, not a commit, push, tag, release, PR, npm publication, or Marketplace publication.

## Audit Publish Handoff Packet

Run:

```bash
npm run audit:publish-packet
```

This checks that the generated publish handoff packet keeps dirty-worktree, strict-sync, publication, and remote-freshness boundaries visible.

## Create Release Decision Record

Run:

```bash
npm run release:decision-record
```

or:

```bash
npm run cli -- release:decision-record
```

This writes `.mimesis/release-decisions/owner-decision-record.json`.
It records pending owner release decisions, not a license choice, commit, push, tag, release, publication, proof, or adoption evidence.

## Audit Release Decision Record

Run:

```bash
npm run audit:release-decision-record
```

or:

```bash
npm run cli -- audit:release-decision-record
```

This checks the owner decision record JSON shape, pending/blocked decision states, required fresh commands, source files, and proof-boundary flags.

## Create Release Evidence Report

Run:

```bash
npm run release:evidence-report
```

or:

```bash
npm run cli -- release:evidence-report
```

This writes `.mimesis/release-evidence/v0.1-report.md`.
It records a publication evidence table and required release evidence for commit, push, tag, npm, Marketplace, plugin, external proof, benchmark, and adoption claims.
It does not publish, stage, commit, push, tag, release, publish to npm, publish a GitHub Marketplace action, choose a license, ship a plugin, create external proof, or prove adoption.

## Audit Release Evidence Report

Run:

```bash
npm run audit:release-evidence-report
```

or:

```bash
npm run cli -- audit:release-evidence-report
```

This checks package script wiring, CLI exposure, release preflight order, generated report sections, publication evidence table visibility, public docs, framework manifest visibility, release artifact manifest coverage, and no-publication boundaries.

## Create Publication Evidence Packet

Run:

```bash
npm run publication:evidence-packet
```

or:

```bash
npm run cli -- publication:evidence-packet
```

This writes `.mimesis/release-evidence/publication-evidence-packet.md` from `docs/PUBLICATION-EVIDENCE-PACKET.md`.
It is direct publication evidence intake for package, action, and plugin claims, not publication proof.
It does not publish, stage, commit, push, tag, release, publish to npm, publish a GitHub Marketplace action, ship a plugin, or close gates.

## Audit Publication Evidence Packet

Run:

```bash
npm run audit:publication-evidence-packet
```

or:

```bash
npm run cli -- audit:publication-evidence-packet
```

This checks package script wiring, CLI exposure, release preflight order, generated packet sections, public docs, framework manifest visibility, release artifact manifest coverage, validator coverage, and the no-publication-proof boundary.

## Create Owner Action Queue

Run:

```bash
npm run owner:queue
```

or:

```bash
npm run cli -- owner:queue
```

This writes `.mimesis/owner-actions/current-action-queue.md`.
It turns current owner, proof, publication, package, action, plugin, benchmark, and adoption gates into a direct owner handoff.
It does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Action Queue

Run:

```bash
npm run audit:owner-queue
```

or:

```bash
npm run cli -- audit:owner-queue
```

This checks package script wiring, CLI exposure, release preflight order, generated queue sections, source packet coverage, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-decision/no-proof boundaries.

## Create Owner Decision Intake

Run:

```bash
npm run owner:decision-intake
```

or:

```bash
npm run cli -- owner:decision-intake
```

This writes `.mimesis/owner-actions/decision-intake.md`.
It turns the owner action queue into a fillable form for `license_or_no_reuse`, `weak_artifact_permission`, `publication_scope`, `package_action_plugin_scope`, `benchmark_adoption_scope`, and `strict_sync_intent`.
It does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Decision Intake

Run:

```bash
npm run audit:owner-decision-intake
```

or:

```bash
npm run cli -- audit:owner-decision-intake
```

This checks package script wiring, CLI exposure, release preflight order, generated intake sections, source packet coverage, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-decision/no-proof boundaries.

## Create Owner Decision Answer Record

Run:

```bash
npm run owner:decision-answer-record
```

or:

```bash
npm run cli -- owner:decision-answer-record
```

This writes `.mimesis/owner-actions/fixture-answer-record.json`.
It turns the owner decision intake into a schema-shaped pending answer record.
It does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Decision Answer Record

Run:

```bash
npm run audit:owner-decision-answer-record
```

or:

```bash
npm run cli -- audit:owner-decision-answer-record
```

This checks package script wiring, CLI exposure, release preflight order, generated answer record freshness, schema shape, required pending owner fields, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-decision/no-proof boundaries.

## Create Owner Answer Review

Run:

```bash
npm run owner:answer-review
```

or:

```bash
npm run cli -- owner:answer-review
```

This writes `.mimesis/owner-actions/answer-review.md`.
It reviews pending owner answers and keeps gates blocked while required evidence is missing.
It does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Answer Review

Run:

```bash
npm run audit:owner-answer-review
```

or:

```bash
npm run cli -- audit:owner-answer-review
```

This checks package script wiring, CLI exposure, release preflight order, generated review sections, blocked gate IDs, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-decision/no-proof boundaries.

## Create Owner Evidence Bundle

Run:

```bash
npm run owner:evidence-bundle
```

or:

```bash
npm run cli -- owner:evidence-bundle
```

This writes `.mimesis/owner-actions/evidence-bundle.md`.
It maps pending owner answer fields to evidence attachments, required commands, and stop conditions.
It is not evidence and does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Evidence Bundle

Run:

```bash
npm run audit:owner-evidence-bundle
```

or:

```bash
npm run cli -- audit:owner-evidence-bundle
```

This checks package script wiring, CLI exposure, release preflight order, generated bundle sections, source paths, pending owner fields, blocked gate IDs, required commands, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-evidence/no-proof boundaries.

## Create Owner Evidence Intake Record

Run:

```bash
npm run owner:evidence-intake-record
```

or:

```bash
npm run cli -- owner:evidence-intake-record
```

This writes `.mimesis/owner-actions/fixture-evidence-record.json`.
It turns the owner evidence bundle into a schema-shaped fixture of pending owner evidence attachments.
It does not attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Evidence Intake Record

Run:

```bash
npm run audit:owner-evidence-intake-record
```

or:

```bash
npm run cli -- audit:owner-evidence-intake-record
```

This checks package script wiring, CLI exposure, release preflight order, generated record freshness, JSON schema conformance, required pending owner evidence fields, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-evidence/no-proof boundaries.

## Create Owner Evidence Review

Run:

```bash
npm run owner:evidence-review
```

or:

```bash
npm run cli -- owner:evidence-review
```

This writes `.mimesis/owner-actions/evidence-review.md`.
It turns pending owner evidence attachments into a readable blocked-gate review.
It does not attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Evidence Review

Run:

```bash
npm run audit:owner-evidence-review
```

or:

```bash
npm run cli -- audit:owner-evidence-review
```

This checks package script wiring, CLI exposure, release preflight order, generated review sections, pending owner evidence fields, blocked gate IDs, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-evidence/no-proof boundaries.

## Create Owner Evidence Attachment Form

Run:

```bash
npm run owner:evidence-attachment-form
```

or:

```bash
npm run cli -- owner:evidence-attachment-form
```

This writes `.mimesis/owner-actions/evidence-attachment-form.md`.
It creates owner-provided evidence slots for the pending gates.
It does not attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Evidence Attachment Form

Run:

```bash
npm run audit:owner-evidence-attachment-form
```

or:

```bash
npm run cli -- audit:owner-evidence-attachment-form
```

This checks package script wiring, CLI exposure, release preflight order, generated form sections, pending owner evidence fields, blocked gate IDs, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-evidence/no-proof boundaries.

## Create Owner Proof Handoff

Run:

```bash
npm run owner:proof-handoff
```

or:

```bash
npm run cli -- owner:proof-handoff
```

This writes `.mimesis/owner-actions/proof-run-handoff.md`.
It reduces the next owner ask to the minimum proof inputs: `license_or_no_reuse` and `weak_artifact_permission`.
It does not choose a license, grant permission, submit an artifact, create external proof, approve proof, publish, close gates, or prove completion.

## Audit Owner Proof Handoff

Run:

```bash
npm run audit:owner-proof-handoff
```

or:

```bash
npm run cli -- audit:owner-proof-handoff
```

This checks package script wiring, CLI exposure, release preflight order, generated handoff sections, source packet coverage, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-decision/no-proof boundaries.

## Create Owner Proof Input Template

Run:

```bash
npm run owner:proof-input-template
```

or:

```bash
npm run cli -- owner:proof-input-template
```

This writes `.mimesis/owner-actions/proof-input-template.json`.
It gives the owner one schema-shaped place to fill `license_or_no_reuse` and `weak_artifact_permission`.
It does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, close gates, or prove completion.

## Check Owner Proof Input

Run:

```bash
npm run owner:proof-input-check
```

or:

```bash
npm run cli -- owner:proof-input-check .mimesis/owner-actions/proof-input-template.json --write-report .mimesis/owner-actions/fixture-proof-input-check.md
```

For a real owner-filled record, require downstream readiness:

```bash
npm run cli -- owner:proof-input-check path/to/owner-proof-input.json --require-ready
```

This writes `.mimesis/owner-actions/fixture-proof-input-check.md`.
The default fixture remains not ready until both owner inputs are reviewed and submitted.
It does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, or close gates.

## Audit Owner Proof Input

Run:

```bash
npm run audit:owner-proof-input
```

or:

```bash
npm run cli -- audit:owner-proof-input
```

This checks package script wiring, CLI exposure, release preflight order, generated template/report sections, schema fields, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, ready-check failure behavior, and no-decision/no-proof boundaries.

## Split Owner Proof Input

Run:

```bash
npm run owner:proof-input-split
```

or:

```bash
npm run cli -- owner:proof-input-split path/to/owner-proof-input.json --output-dir path/to/split-output --require-ready
```

This writes `.mimesis/owner-actions/proof-input-split-report.md` for the default not-ready template.
For a reviewed owner proof input record, it can write downstream owner decision and owner evidence record candidates.
It does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, or close gates.

## Audit Owner Proof Input Split

Run:

```bash
npm run audit:owner-proof-input-split
```

or:

```bash
npm run cli -- audit:owner-proof-input-split
```

This checks package script wiring, CLI exposure, release preflight order, generated split report, reviewed-record split smoke path, downstream license/evidence/proof-intake bridges, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-proof/no-closure boundaries.

## Create Owner Evidence Submission Record

Run:

```bash
npm run owner:evidence-submission-record
```

or:

```bash
npm run cli -- owner:evidence-submission-record
```

This writes `.mimesis/owner-actions/fixture-evidence-submission-record.json`.
It records `not_submitted_owner_evidence` from the owner evidence attachment form and pending owner evidence record.
It does not submit evidence, attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Evidence Submission Record

Run:

```bash
npm run audit:owner-evidence-submission-record
```

or:

```bash
npm run cli -- audit:owner-evidence-submission-record
```

This checks package script wiring, CLI exposure, release preflight order, generated JSON schema conformance, missing owner evidence fields, blocked gate IDs, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-submitted-evidence/no-proof boundaries.

## Check Owner Evidence Submission Record

Run:

```bash
npm run owner:evidence-submission-check
```

or:

```bash
npm run cli -- owner:evidence-submission-check .mimesis/owner-actions/fixture-evidence-submission-record.json --write-report .mimesis/owner-actions/fixture-evidence-submission-check.md
```

For one permissioned weak artifact, check only the field that can move into case review:

```bash
npm run cli -- owner:evidence-submission-check path/to/owner-evidence-submission-record.json --require-field weak_artifact_permission
```

This writes `.mimesis/owner-actions/fixture-evidence-submission-check.md`.
It checks an owner evidence submission record before gate movement, and `--require-field weak_artifact_permission` checks field-level readiness without requiring unrelated publication, package, benchmark, or adoption fields.
It does not submit evidence, attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

## Audit Owner Evidence Submission Check

Run:

```bash
npm run audit:owner-evidence-submission-check
```

or:

```bash
npm run cli -- audit:owner-evidence-submission-check
```

This checks package script wiring, CLI exposure, release preflight order, generated report sections, field-level readiness, unsafe-record rejection, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-submitted-evidence/no-closure boundaries.

## Create Current State Summary

Run:

```bash
npm run state:summary
```

or:

```bash
npm run cli -- state:summary
```

This writes `.mimesis/state/current-state.json`.
It summarizes the current gap register, gap closure plan, gate board, owner action queue, and release evidence report.
It does not close gates, prove completion, publish, choose a license, create external proof, or prove adoption.

## Audit Current State Summary

Run:

```bash
npm run audit:state-summary
```

or:

```bash
npm run cli -- audit:state-summary
```

This checks package script wiring, CLI exposure, release preflight order, generated summary source coverage, gap IDs, boundaries, schema visibility, public docs, framework manifest visibility, release artifact manifest coverage, and no-proof/no-closure claims.

## Create Worktree Review Packet

Run:

```bash
npm run worktree:packet
```

or:

```bash
npm run cli -- worktree:packet
```

This writes `.mimesis/worktree/review-packet.json`.
It inventories the local dirty worktree for review before publication.
It does not stage, commit, push, tag, release, publish, prove remote freshness, or close strict sync.

## Audit Worktree Review Packet

Run:

```bash
npm run audit:worktree-packet
```

or:

```bash
npm run cli -- audit:worktree-packet
```

This checks the worktree review packet, public docs, package script wiring, CLI exposure, spec schema, and git status counts.
It does not publish, stage, commit, push, tag, release, prove remote freshness, or close strict sync.

## Create Release Review Bundle

Run:

```bash
npm run release:review-bundle
```

or:

```bash
npm run cli -- release:review-bundle
```

This writes `.mimesis/release-review/v0.1-bundle.json`.
It classifies the dirty worktree into review groups before any commit or publication decision.
It does not stage, commit, push, tag, release, publish, choose a license, prove remote freshness, or close strict sync.

## Create Goal Completion Audit

Run:

```bash
npm run goal:completion-audit
```

or:

```bash
npm run cli -- goal:completion-audit
```

This writes `.mimesis/completion/goal-completion-audit.json`.
It maps objective evidence and open gates for the active goal from `docs/GOAL-COMPLETION-AUDIT.md`.
It does not mark the goal complete, close gates, publish, choose a license, create external proof, prove benchmarked productivity, or prove adoption.

## Audit Goal Completion Audit

Run:

```bash
npm run audit:goal-completion-audit
```

or:

```bash
npm run cli -- audit:goal-completion-audit
```

This checks package script wiring, CLI exposure, release preflight order, generated JSON shape, public docs, framework manifest visibility, release artifact manifest coverage, validator coverage, and no-completion-proof boundaries.

## Audit Release Review Bundle

Run:

```bash
npm run audit:release-review-bundle
```

or:

```bash
npm run cli -- audit:release-review-bundle
```

This checks the release review bundle, review groups, public docs, package script wiring, CLI exposure, spec schema, and no-commit/no-publication boundaries.
It does not stage, commit, push, tag, release, publish, choose a license, prove remote freshness, or close strict sync.

## Create Release Artifact Manifest

Run:

```bash
npm run release:artifact-manifest
```

or:

```bash
npm run cli -- release:artifact-manifest
```

This writes `.mimesis/release-artifacts/v0.1-manifest.json`.
It records selected local release-review artifacts with SHA-256 hashes.
It does not publish, stage, commit, push, tag, release, choose a license, create external proof, or prove adoption.

## Audit Release Artifact Manifest

Run:

```bash
npm run audit:release-artifact-manifest
```

or:

```bash
npm run cli -- audit:release-artifact-manifest
```

This checks the generated release artifact manifest, required artifacts, per-file `sha256` values, package script wiring, CLI exposure, release preflight hook, and proof boundaries.

## Audit Status Roadmap Sync

Run:

```bash
npm run audit:status-roadmap
```

or:

```bash
npm run cli -- audit:status-roadmap
```

This checks that `STATUS.md` and `ROADMAP.md` name the current local v0.1 implementation surface, including the release artifact manifest, worktree review packet, release review bundle, and goal completion audit.
It does not prove completion, publish, stage, commit, push, tag, release, choose a license, create external proof, or prove adoption.

## Create Release Execution Packet

Run:

```bash
npm run release:execution-packet
```

or:

```bash
npm run cli -- release:execution-packet
```

This writes `.mimesis/release-execution/v0.1-owner-handoff.md`.
It is an owner release execution handoff, not a commit, push, tag, release, package publication, Marketplace publication, license choice, or external proof.
It points to runtime-only execution gates instead of embedding branch, commit hash, dirty-worktree, changed-entry, or sync-report proof.

## Audit Release Execution Packet

Run:

```bash
npm run audit:release-execution
```

This checks that the generated release execution packet includes runtime-only execution gates, required preflight, owner decisions, release sequence, publication gates, allowed claim, disallowed claim, proof boundary, and no volatile execution snapshot text.

## Create Public Claim Pack

Run:

```bash
npm run claim:pack
```

or:

```bash
npm run cli -- claim:pack
```

This writes `.mimesis/claim-packs/public-v0.1.md`.
It is a local public-copy guardrail, not publication, adoption proof, benchmark proof, legal proof, or certification.

## Audit Public Claim Pack

Run:

```bash
npm run audit:claim-pack
```

This checks that the generated public claim pack keeps allowed claims, disallowed claims, evidence links, copy snippets, stop conditions, and proof boundaries visible.

## Boundary

The validator proves local protocol consistency.
It does not prove external adoption, productivity gains, legal originality, or shipped plugins.

## Local CLI

Run:

```bash
npm run cli -- help
```

The CLI wraps the local scripts for initialization, validation, framework manifest generation, source audit, activation audit, completion audit, release-order audit, worktree review packet generation, release review bundle generation, ecosystem resource indexing, evidence packet checking, publication packet generation, and release preflight.
It is not an npm package release.

## Audit CLI

Run:

```bash
npm run audit:cli
```

This checks that the local CLI exposes the expected commands and keeps the package-release boundary visible.

## Audit Activation Surface

Run:

```bash
npm run audit:activation
```

This checks the README first-screen promise, 30-second understanding, 5-minute first loop, quickstart commands, and seven artifact headings.
It does not prove external adoption, benchmarked productivity, customer outcomes, publication, or that a reader finished a real case.

## Audit Package Release Candidate

Run:

```bash
npm run audit:package
```

This runs `npm pack --dry-run --json` and checks the local package candidate surface.
It does not publish to npm.

## Audit GitHub Action Release Candidate

Run:

```bash
npm run audit:action
```

This checks the root `action.yml` candidate and marketplace boundary.
It does not publish a GitHub Marketplace action or create a tagged public action release.

## Initialize `.mimesis`

Run:

```bash
node tools/init-mimesis.mjs path/to/project
```

This creates a `.mimesis` folder from the templates.
Existing files are preserved by default.

To overwrite existing files:

```bash
node tools/init-mimesis.mjs path/to/project --force
```

## Create Gemini CLI Packet

Run:

```bash
npm run adapter:gemini
```

This writes `.mimesis/adapter-packets/gemini-cli.md`.
It prepares a local packet for Gemini CLI use.
It does not execute Gemini CLI or prove OAuth/account integration.

## Create Claude Code Packet

Run:

```bash
npm run adapter:claude
```

This writes `.mimesis/adapter-packets/claude-code.md`.
It prepares a local packet for Claude Code use.
It does not execute Claude Code or prove account integration.

## Audit Ecosystem

Run:

```bash
npm run audit:ecosystem
```

This checks whether the neighboring `mimesis-canvas` and `mimesis-casebook` repositories are present with the expected public resources.

Boundary:
This is a local workspace audit.
It does not prove the public remote repositories are up to date.

## Audit Remote Ecosystem

Run:

```bash
npm run audit:remote
```

This uses GitHub CLI to check that the expected public repositories are visible, public, on `main`, not archived, and not forks.

Boundary:
This is a read-only visibility check.
It does not prove remote content freshness, adoption, or usage.

## Audit Sync Status

Run:

```bash
npm run audit:sync
```

This writes `.mimesis/sync-status.md`.
It reports whether the local branch matches upstream and whether the worktree has unpublished changes.

Strict publish sync gate:

```bash
npm run audit:sync:strict
```

This fails unless the worktree is clean and synced with upstream.

## Audit Adapters

Run:

```bash
npm run audit:adapters
```

This checks adapter status labels.
Adapters marked `prototype`, `usable`, or `verified` must include local evidence.

## Audit Issue Forms

Run:

```bash
npm run audit:issues
```

This checks that the GitHub issue forms preserve the expected Mimesis submission fields.

## Audit Plugins

Run:

```bash
npm run audit:plugins
```

This checks plugin status labels and evidence requirements.

## Audit Codex Plugin Scaffold

Run:

```bash
npm run audit:codex-plugin
```

This checks the local `plugins/mimesis-codex` manifest, Mimesis skill entrypoint, status matrix, package script, CLI command, and release preflight hook.
It does not publish a plugin, install anything in Codex, prove external adoption, or create external proof.

## Create MCP Resource Index

Run:

```bash
npm run mcp:resources
```

or:

```bash
npm run cli -- mcp:resources
```

This writes `.mimesis/mcp/resource-index.json`.
It maps Mimesis files to `mimesis://` resources and local command descriptors.
It does not start a long-running MCP server.

## Audit MCP Server Scaffold

Run:

```bash
npm run audit:mcp-server
```

This checks the local `plugins/mimesis-mcp` manifest, resources, tools, generated index, package script, CLI command, and release preflight hook.
It does not ship an MCP server, install a connector, expose secrets, prove external adoption, or create external proof.

## Run MCP Stdio Candidate

Run:

```bash
npm run mcp:serve
```

or:

```bash
npm run cli -- mcp:serve
```

This starts a local line-delimited JSON-RPC stdio candidate for Mimesis resources.
It supports `initialize`, `resources/list`, `resources/read`, `tools/list`, and `prompts/list`.
It does not execute tool commands, install an MCP connector, prove official host compliance, or create external adoption proof.

## Audit MCP Stdio Candidate

Run:

```bash
npm run audit:mcp-stdio
```

This smoke-tests the local stdio candidate by reading a resource, listing resources, listing tool descriptors, listing prompts, and verifying that `tools/call` fails safely.

## Audit License Boundary

Run:

```bash
npm run audit:license
```

This checks that the repository does not imply open-source reuse rights before the owner chooses a license.

## Audit Source-First Discipline

Run:

```bash
npm run audit:sources
```

This checks the source-first protocol, reference-set fields, reference-pack source quality sections, and reference-pack issue form fields.

## Audit Secret Safety

Run:

```bash
npm run audit:secrets
```

This writes `.mimesis/security/secret-safety-report.md` and scans local files for common credential patterns and risky credential filenames.
It is a local heuristic guardrail, not production-grade security proof or complete private-data detection.

## Audit Completion Matrix

Run:

```bash
npm run audit:completion
```

This checks that the completion matrix names the main v0.1 requirements, evidence links, allowed claim, disallowed claim, and remaining gates.

## Audit Completion Row Count

Run:

```bash
npm run audit:completion-row-count
```

This checks that `audit:completion` reports the visible requirement matrix row count as well as the required row-name check count.

## Audit Release Check Order

Run:

```bash
npm run audit:release-order
```

This checks that generated packets and report-producing commands run before dependent audits and validators, including `audit:secrets before validate`.
It does not publish, stage, commit, push, tag, release, choose a license, or create external proof.

## Create Publication Packet

Run:

```bash
npm run release:packet
```

This writes `.mimesis/publication-packets/v0.1.md` from the release packet and completion audit.

## Audit Publication Packet

Run:

```bash
npm run audit:publication
```

This checks that the generated publication packet keeps the required preflight, evidence, allowed claim, disallowed claim, remaining gates, and proof boundary visible.

## Audit Release Readiness

Run:

```bash
npm run audit:release
```

This checks that the v0.1 framework surface is coherent and that remaining gates are explicit.

## Release Preflight

Run:

```bash
npm run release:check
```

This generates the local publication packet, first-proof packet, first external proof intake kit, proof intake fixture record, proof intake check report, proof readiness packet, proof-run packet, license decision packet, framework manifest, reference pack index, first-loop demo, MCP resource index, plugin install-readiness packet, plugin/action release-candidate packet, publish/sync handoff packet, release execution packet, release decision record, gap register, current state summary, worktree review packet, release review bundle, goal completion audit, release artifact manifest, current gate board, ecosystem operator runbook, ecosystem resource packet, public claim pack, case publication packet, draft evidence packet from the completed local case, benchmark packet, adoption packet, and publication evidence packet, then runs the local protocol validator, proof intake schema audit, proof intake record audit, proof intake check audit, framework manifest schema audit, framework manifest audit, reference pack index audit, activation-surface audit, first-loop demo audit, case-start audit, case-check audit, permissioned-case intake audit, permissioned-case fixture audit, case-from-intake audit, case-from-record audit, case publication audit, evidence-from-case audit, evidence-review audit, evidence packet audit, claim-from-evidence audit, proof queue audit, proof packet audit, proof-intake audit, proof-readiness audit, proof-run audit, proof-run dry audit, adapter audit, plugin audit, Codex plugin scaffold audit, MCP server scaffold audit, MCP stdio runtime audit, plugin install packet audit, plugin packet audit, publish packet audit, release execution audit, release decision record audit, gap register audit, release artifact manifest audit, worktree review packet audit, release review bundle audit, goal completion audit, status roadmap sync audit, gate-board audit, operator-runbook audit, ecosystem resource audit, public claim pack audit, benchmark packet audit, adoption packet audit, publication evidence packet audit, issue-form audit, secret safety audit, source-first audit, completion audit, completion row-count audit, release-order audit, publication packet audit, license-boundary audit, license packet audit, and release-readiness audit.
It also runs the workspace check plus package and root-action release-candidate audits.

## Audit Non-Writing Strict Sync

Run:

```bash
npm run audit:sync:strict-nonwriting
```

or:

```bash
npm run cli -- audit:sync:strict-nonwriting
```

This checks the non-writing strict sync boundary in `docs/PUBLISH-SYNC-GATE.md`.
It ensures `audit:sync:strict` uses `--no-write`, reports `head matches upstream`, and does not mutate the worktree while checking publication readiness.

If the neighboring repositories are checked out beside this one:

```bash
npm run release:check:workspace
```

This adds the local ecosystem audit.

If public GitHub repository metadata is reachable, run:

```bash
npm run release:check:public
```

This includes the remote visibility audit and the forced remote fallback audit.
The fallback path does not prove remote content freshness or adoption.

If GitHub CLI is available and public repository visibility should be checked too:

```bash
npm run release:check:public
```

Strict publish readiness:

```bash
npm run release:ready:publish
```

This also requires the sync strict gate.
