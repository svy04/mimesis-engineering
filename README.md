# Mimesis Engineering

> Give AI standards, not roles.

Most people ask AI to pretend.

```text
You are a world-class expert.
```

Mimesis starts from real artifacts.

```text
Here are the best artifacts in this field.
Study their structure.
Transform my work under my constraints.
Show the proof boundary.
```

Bring one weak artifact.
Leave with a stronger one.

## Understand In 30 Seconds

Mimesis Engineering is a small public framework for improving AI-assisted work.

Instead of asking AI to roleplay an expert, you give it real artifacts to study:

- strong references
- a weak artifact
- constraints
- proof boundaries
- a visible artifact trail

The output is not just a better sentence.
The output is a before/after case with files that show how the work changed.

한국어:

AI에게 역할이 아니라 기준을 줘라.

대부분은 AI에게 전문가인 척하라고 시킨다.
미메시스는 AI에게 실제로 공부할 산출물을 준다.

약한 산출물 하나를 가져와라.
더 강한 산출물로 나가라.

## What This Is

Mimesis Engineering is an artifact-first work system for AI-native builders.

It helps you:

- collect strong references
- decompose their structure
- extract transferable patterns
- transform your own artifact
- inspect originality and proof boundaries
- publish a case note

## The Old Way vs The Mimesis Way

| Old Way | Mimesis Way |
| --- | --- |
| Ask AI to act like an expert | Show AI expert artifacts |
| Start from a vague prompt | Start from strong standards |
| Optimize wording | Extract structure |
| Chase style | Inspect proof and boundaries |
| Ship average output | Ship a stronger artifact with a case note |

## Bring One Weak Artifact

Bring:

- a weak README
- a weak landing page
- a weak product idea
- a weak blog draft
- a weak prompt
- a weak workflow

Run one Mimesis loop.
Leave with a stronger artifact and a proof boundary.

## See It Work

Case 001:
Mimesis Engineering applied to Mimesis Engineering itself.

Before:
A strong idea with weak activation proof.

After:
A clearer work system with a canvas, reference pack, case note, and originality boundary.

Read the case:
[cases/001-mimesis-on-mimesis.md](cases/001-mimesis-on-mimesis.md)

## The Seven Artifacts

One Mimesis loop produces:

- [Artifact Brief](docs/WHAT-YOU-GET.md#artifact-brief)
- [Reference Set](docs/WHAT-YOU-GET.md#reference-set)
- [Structure Map](docs/WHAT-YOU-GET.md#structure-map)
- [Transformation Plan](docs/WHAT-YOU-GET.md#transformation-plan)
- [Improved Artifact](docs/WHAT-YOU-GET.md#improved-artifact)
- [Boundary Check](docs/WHAT-YOU-GET.md#boundary-check)
- [Case Note](docs/WHAT-YOU-GET.md#case-note)

## 5-Minute First Loop

Start here:
[docs/QUICKSTART.md](docs/QUICKSTART.md)

Run the local first-loop demo:

```bash
npm run first-loop:demo
npm run audit:first-loop
```

This generates `.mimesis/first-loop-demo/` and checks it with `workspace:check` and `case:check`.
It is local demo evidence, not external adoption or outcome proof.

Generate the AI-native framework manifest:

```bash
npm run framework:manifest
npm run audit:framework-manifest-schema
npm run audit:framework-manifest
```

This writes `.mimesis/framework-manifest.json`.
It indexes entrypoints, commands, artifacts, gates, and proof boundaries for agents and local tooling.
The schema lives at `spec/framework-manifest.schema.json`.
It does not prove external adoption or package publication.

Generate the source-first reference pack index:

```bash
npm run reference:index
npm run audit:reference-index
```

This writes `.mimesis/reference-packs/index.json`.
It makes the standards in `reference-packs/` machine-readable without turning them into swipe files.

Minimal path:

1. Choose one weak artifact.
2. Pick a reference pack.
3. Decompose the references.
4. Extract transferable structure.
5. Transform your artifact.
6. Inspect the boundary.
7. Write a case note.

## More Entry Points

- Korean first-start page: [docs/START-HERE.ko.md](docs/START-HERE.ko.md)
- Working spec: [docs/WORKING-SPEC.md](docs/WORKING-SPEC.md)
- Initial implementation strategy: [docs/INITIAL-IMPLEMENTATION-STRATEGY.md](docs/INITIAL-IMPLEMENTATION-STRATEGY.md)
- Launch strategy: [docs/LAUNCH-STRATEGY.md](docs/LAUNCH-STRATEGY.md)
- Traffic absorption system: [docs/TRAFFIC-ABSORPTION-SYSTEM.md](docs/TRAFFIC-ABSORPTION-SYSTEM.md)
- Codex task template: [templates/codex-master-task.md](templates/codex-master-task.md)
- Hermes operator template: [templates/hermes-launch-operator.md](templates/hermes-launch-operator.md)

## Framework v0.1

This repository now exposes Mimesis as a plain-file framework:

- [spec/README.md](spec/README.md) - spec index and schema boundary map
- [spec/mimesis-v0.1.md](spec/mimesis-v0.1.md) - the v0.1 framework contract
- [spec/file-protocol.md](spec/file-protocol.md) - required `.mimesis` files
- [spec/framework-manifest.schema.json](spec/framework-manifest.schema.json) - machine-readable manifest schema
- [docs/FRAMEWORK-MANIFEST.md](docs/FRAMEWORK-MANIFEST.md) - generated AI-native framework manifest
- [docs/FRAMEWORK-MANIFEST-SCHEMA.md](docs/FRAMEWORK-MANIFEST-SCHEMA.md) - manifest schema audit and boundary
- [.mimesis/README.md](.mimesis/README.md) - copyable loop workspace
- [templates/README.md](templates/README.md) - fillable loop templates
- [reference-packs/README.md](reference-packs/README.md) - standards to study
- [docs/REFERENCE-PACK-INDEX.md](docs/REFERENCE-PACK-INDEX.md) - generated source-first reference pack index
- [cases/README.md](cases/README.md) - before/after proof surface
- [examples/README.md](examples/README.md) - starting scenarios
- [prompts/README.md](prompts/README.md) - prompts that support the loop
- [adapters/README.md](adapters/README.md) - tool integration contracts
- [docs/SUPERPOWERS-ADAPTER.md](docs/SUPERPOWERS-ADAPTER.md) - Superpowers adapter contract for process discipline plus Mimesis artifact standards
- [plugins/README.md](plugins/README.md) - plugin shapes, local scaffolds, and boundaries
- [tools/README.md](tools/README.md) - local protocol checks
- [docs/ACTIVATION-SURFACE.md](docs/ACTIVATION-SURFACE.md) - 30-second and 5-minute first-action guard
- [docs/FIRST-LOOP-DEMO.md](docs/FIRST-LOOP-DEMO.md) - generated local first-loop demo
- [STATUS.md](STATUS.md) - current claim and implementation status
- [ROADMAP.md](ROADMAP.md) - proof-gated next versions
- [LICENSE.md](LICENSE.md) - license selection boundary
- [docs/LICENSE-PACKET.md](docs/LICENSE-PACKET.md) - generated owner license decision packet
- [docs/OPERATOR-RUNBOOK.md](docs/OPERATOR-RUNBOOK.md) - generated ecosystem operator runbook
- [docs/ECOSYSTEM-RESOURCE-PACKET.md](docs/ECOSYSTEM-RESOURCE-PACKET.md) - generated local ecosystem resource index
- [docs/BENCHMARK-PACKET.md](docs/BENCHMARK-PACKET.md) - generated benchmark/adoption measurement protocol
- [docs/V0.1-RELEASE-PACKET.md](docs/V0.1-RELEASE-PACKET.md) - release preflight and public claim boundary
- [docs/RELEASE-CHECK-ORDER.md](docs/RELEASE-CHECK-ORDER.md) - release preflight ordering guard
- [docs/V0.2-PROOF-QUEUE.md](docs/V0.2-PROOF-QUEUE.md) - first permissioned proof loop queue
- [docs/FIRST-PROOF-PACKET.md](docs/FIRST-PROOF-PACKET.md) - generated v0.2 first-proof handoff packet
- [docs/PROOF-INTAKE-KIT.md](docs/PROOF-INTAKE-KIT.md) - generated first external proof intake kit
- [docs/PROOF-INTAKE-RECORD.md](docs/PROOF-INTAKE-RECORD.md) - generated schema-shaped proof intake fixture record
- [docs/PROOF-INTAKE-CHECK.md](docs/PROOF-INTAKE-CHECK.md) - local proof intake check before case creation
- [docs/PROOF-INTAKE-SCHEMA.md](docs/PROOF-INTAKE-SCHEMA.md) - local schema contract for proof intake records
- [docs/PROOF-REDACTION-PACKET.md](docs/PROOF-REDACTION-PACKET.md) - generated redaction checklist packet before proof intake review
- [docs/PROOF-SUBMISSION-PACKET.md](docs/PROOF-SUBMISSION-PACKET.md) - generated submission handoff packet before proof intake review
- [docs/PROOF-READINESS-PACKET.md](docs/PROOF-READINESS-PACKET.md) - generated first weak artifact readiness packet
- [docs/PROOF-RUN-PACKET.md](docs/PROOF-RUN-PACKET.md) - generated operator packet for the first proof run
- [docs/PROOF-EXECUTION-REPORT.md](docs/PROOF-EXECUTION-REPORT.md) - generated command evidence ledger for the first proof run
- [docs/FIRST-PROOF-CANDIDATE-PACKET.md](docs/FIRST-PROOF-CANDIDATE-PACKET.md) - generated candidate selection packet for the first proof candidate
- [docs/PROOF-RUN-DRY-AUDIT.md](docs/PROOF-RUN-DRY-AUDIT.md) - local fixture audit for the proof-run path
- [docs/COMPLETION-AUDIT.md](docs/COMPLETION-AUDIT.md) - requirement matrix, evidence, and remaining gates
- [docs/GAP-REGISTER.md](docs/GAP-REGISTER.md) - generated machine-readable open-gate register
- [docs/GATEBOARD.md](docs/GATEBOARD.md) - generated current owner/proof/publication gate board
- [docs/CURRENT-STATE-SUMMARY.md](docs/CURRENT-STATE-SUMMARY.md) - generated machine-readable current state summary
- [docs/WORKTREE-REVIEW-PACKET.md](docs/WORKTREE-REVIEW-PACKET.md) - generated dirty worktree review packet
- [docs/RELEASE-REVIEW-BUNDLE.md](docs/RELEASE-REVIEW-BUNDLE.md) - generated release review bundle
- [docs/EVIDENCE-PACKET.md](docs/EVIDENCE-PACKET.md) - strong-claim evidence gate
- [docs/EVIDENCE-FROM-CASE.md](docs/EVIDENCE-FROM-CASE.md) - draft evidence packet from completed case evidence
- [docs/EVIDENCE-REVIEW.md](docs/EVIDENCE-REVIEW.md) - named reviewer decision for evidence packets
- [docs/CLAIM-FROM-EVIDENCE.md](docs/CLAIM-FROM-EVIDENCE.md) - bounded claim candidate from reviewed evidence
- [docs/CASE-START.md](docs/CASE-START.md) - start a case workspace from one weak artifact
- [docs/CASE-CHECK.md](docs/CASE-CHECK.md) - check whether a case has completed local evidence
- [docs/PERMISSIONED-CASE-CHECK.md](docs/PERMISSIONED-CASE-CHECK.md) - review permissioned external case intake
- [docs/PERMISSIONED-CASE-FIXTURE.md](docs/PERMISSIONED-CASE-FIXTURE.md) - reviewable permissioned intake fixture boundary
- [docs/CASE-FROM-INTAKE.md](docs/CASE-FROM-INTAKE.md) - create a started case workspace from reviewed intake
- [docs/CASE-FROM-RECORD.md](docs/CASE-FROM-RECORD.md) - create a started case workspace from a proof intake record
- [docs/CASE-PUBLICATION-PACKET.md](docs/CASE-PUBLICATION-PACKET.md) - generate a bounded casebook candidate packet
- [docs/PACKAGE-RELEASE-CANDIDATE.md](docs/PACKAGE-RELEASE-CANDIDATE.md) - local npm package candidate boundary
- [docs/ACTION-RELEASE-CANDIDATE.md](docs/ACTION-RELEASE-CANDIDATE.md) - root GitHub Action candidate boundary
- [docs/PLUGIN-INSTALL-PACKET.md](docs/PLUGIN-INSTALL-PACKET.md) - generated local Codex plugin install-readiness packet
- [docs/PLUGIN-RELEASE-PACKET.md](docs/PLUGIN-RELEASE-PACKET.md) - generated plugin/action release-candidate packet
- [docs/PUBLISH-SYNC-GATE.md](docs/PUBLISH-SYNC-GATE.md) - clean worktree and upstream sync gate
- [docs/PUBLISH-HANDOFF-PACKET.md](docs/PUBLISH-HANDOFF-PACKET.md) - generated local publish/sync handoff packet
- [docs/RELEASE-EVIDENCE-REPORT.md](docs/RELEASE-EVIDENCE-REPORT.md) - generated publication evidence checklist
- [docs/PUBLICATION-EVIDENCE-PACKET.md](docs/PUBLICATION-EVIDENCE-PACKET.md) - generated direct publication evidence intake packet
- [docs/GOAL-COMPLETION-AUDIT.md](docs/GOAL-COMPLETION-AUDIT.md) - generated active-goal completion audit without completion proof
- [docs/OWNER-ACTION-QUEUE.md](docs/OWNER-ACTION-QUEUE.md) - generated owner action queue
- [docs/OWNER-PROOF-HANDOFF.md](docs/OWNER-PROOF-HANDOFF.md) - generated minimum owner proof handoff
- [docs/OWNER-PROOF-INPUT.md](docs/OWNER-PROOF-INPUT.md) - owner-fillable proof input template and checker
- [docs/OWNER-PROOF-INPUT-ISSUE.md](docs/OWNER-PROOF-INPUT-ISSUE.md) - public owner proof input issue handoff
- [docs/OWNER-PROOF-INPUT-SPLIT.md](docs/OWNER-PROOF-INPUT-SPLIT.md) - split reviewed owner proof input into downstream record candidates
- [docs/OWNER-DECISION-INTAKE.md](docs/OWNER-DECISION-INTAKE.md) - generated owner decision intake
- [docs/OWNER-DECISION-ANSWER-RECORD.md](docs/OWNER-DECISION-ANSWER-RECORD.md) - generated schema-shaped owner decision answer record
- [docs/OWNER-ANSWER-REVIEW.md](docs/OWNER-ANSWER-REVIEW.md) - generated owner answer review
- [docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md](docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md) - generated owner evidence attachment form
- [docs/OWNER-EVIDENCE-SUBMISSION-RECORD.md](docs/OWNER-EVIDENCE-SUBMISSION-RECORD.md) - generated owner evidence submission record
- [docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md](docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md) - local owner evidence submission check before gate movement
- [docs/OWNER-EVIDENCE-BUNDLE.md](docs/OWNER-EVIDENCE-BUNDLE.md) - generated owner evidence bundle
- [docs/OWNER-EVIDENCE-INTAKE-RECORD.md](docs/OWNER-EVIDENCE-INTAKE-RECORD.md) - generated schema-shaped owner evidence intake record
- [docs/OWNER-EVIDENCE-REVIEW.md](docs/OWNER-EVIDENCE-REVIEW.md) - generated owner evidence review
- [docs/RELEASE-DECISION-RECORD.md](docs/RELEASE-DECISION-RECORD.md) - generated owner release decision record
- [docs/RELEASE-ARTIFACT-MANIFEST.md](docs/RELEASE-ARTIFACT-MANIFEST.md) - generated SHA-256 release artifact manifest
- [docs/ADOPTION-PACKET.md](docs/ADOPTION-PACKET.md) - generated external adoption evidence intake packet
- [docs/GAP-CLOSURE-PLAN.md](docs/GAP-CLOSURE-PLAN.md) - generated evidence steps for closing open gates without claiming closure
- [docs/GATE-EVIDENCE-PACKET.md](docs/GATE-EVIDENCE-PACKET.md) - generated evidence intake packet for routing open gates to evidence requirements
- [docs/GATE-CLOSURE-READINESS.md](docs/GATE-CLOSURE-READINESS.md) - generated readiness report for open gates before any closure claim
- [docs/GATE-CLOSURE-REVIEW.md](docs/GATE-CLOSURE-REVIEW.md) - generated gate closure review record that keeps gates open without approving closure
- [docs/RELEASE-EXECUTION-PACKET.md](docs/RELEASE-EXECUTION-PACKET.md) - generated owner release execution handoff
- [docs/PUBLIC-CLAIM-PACK.md](docs/PUBLIC-CLAIM-PACK.md) - generated public copy and claim boundary
- [docs/STATUS-ROADMAP-SYNC.md](docs/STATUS-ROADMAP-SYNC.md) - status roadmap sync audit
- [docs/SOURCE-FIRST-PROTOCOL.md](docs/SOURCE-FIRST-PROTOCOL.md) - source provenance and primary-reference discipline
- [docs/SECRET-SAFETY-GATE.md](docs/SECRET-SAFETY-GATE.md) - local credential-pattern and risky-file guardrail
- [docs/ECOSYSTEM.md](docs/ECOSYSTEM.md) - how engineering, canvas, and casebook fit together
- [docs/CASEBOOK-PROTOCOL.md](docs/CASEBOOK-PROTOCOL.md) - how public cases should be shaped
- [docs/REMOTE-ECOSYSTEM-AUDIT.md](docs/REMOTE-ECOSYSTEM-AUDIT.md) - read-only public repository visibility check

The v0.1 implementation is intentionally Markdown-first.
Adapters and plugins are documented as contracts unless explicitly marked otherwise.

Validate the local framework surface:

```bash
npm run validate
```

or:

```bash
node tools/validate-mimesis.mjs
```

The same validator is wired as a repository workflow at `.github/workflows/validate-mimesis.yml`.
The workflow also runs `npm run audit:adapters`.

Initialize a `.mimesis` workspace in another project:

```bash
node tools/init-mimesis.mjs path/to/project
```

The `package.json` is marked `private` because v0.1 is not an npm package release.

Use the local CLI wrapper:

```bash
npm run cli -- help
npm run cli -- case:start --artifact README.md --reference-pack reference-packs/github-readme.md --title "README Loop"
npm run cli -- case:check .
npm run cli -- case:review path/to/permissioned-case.md
npm run cli -- audit:permissioned-fixture
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md
npm run cli -- case:from-record .mimesis/proof-intake/fixture-record.json
npm run cli -- case:publish-packet .
npm run cli -- evidence:check path/to/evidence-packet.md
npm run cli -- gap:register
npm run cli -- audit:gap-register
npm run cli -- gate:board
npm run cli -- proof:packet
npm run cli -- proof:intake
npm run cli -- proof:intake-record
npm run cli -- proof:intake-check
npm run cli -- audit:proof-intake-record
npm run cli -- audit:proof-intake-check
npm run cli -- audit:proof-intake-schema
npm run cli -- proof:readiness
npm run cli -- audit:proof-readiness
npm run cli -- proof:run-packet
npm run cli -- license:packet
npm run cli -- operator:runbook
npm run cli -- ecosystem:resources
npm run cli -- benchmark:packet
npm run cli -- adoption:packet
npm run cli -- audit:adoption-packet
npm run cli -- first-loop:demo
npm run cli -- audit:first-loop
npm run cli -- framework:manifest
npm run cli -- audit:framework-manifest-schema
npm run cli -- audit:framework-manifest
npm run cli -- audit:spec-index
npm run cli -- state:summary
npm run cli -- audit:state-summary
npm run cli -- audit:state-snapshot-boundary
npm run cli -- reference:index
npm run cli -- audit:reference-index
npm run cli -- plugin:install-packet
npm run cli -- audit:plugin-install-packet
npm run cli -- plugin:packet
npm run cli -- audit:codex-plugin
npm run cli -- mcp:resources
npm run cli -- mcp:serve
npm run cli -- audit:mcp-server
npm run cli -- audit:mcp-stdio
npm run cli -- publish:packet
npm run cli -- release:execution-packet
npm run cli -- release:decision-record
npm run cli -- release:evidence-report
npm run cli -- publication:evidence-packet
npm run cli -- audit:publication-evidence-packet
npm run cli -- goal:completion-audit
npm run cli -- audit:goal-completion-audit
npm run cli -- owner:queue
npm run cli -- owner:proof-handoff
npm run cli -- audit:owner-proof-handoff
npm run cli -- owner:proof-input-issue
npm run cli -- owner:proof-input-request
npm run cli -- owner:proof-input-remote-issue
npm run cli -- owner:proof-input-issue-convert
npm run cli -- owner:proof-input-review
npm run cli -- audit:owner-proof-input-issue
npm run cli -- audit:owner-proof-input-request
npm run cli -- audit:owner-proof-input-remote-issue
npm run cli -- audit:owner-proof-input-issue-convert
npm run cli -- audit:owner-proof-input-review
npm run cli -- owner:proof-input-template
npm run cli -- owner:proof-input-check
npm run cli -- owner:proof-input-split
npm run cli -- audit:owner-proof-input
npm run cli -- audit:owner-proof-input-split
npm run cli -- owner:decision-intake
npm run cli -- owner:decision-answer-record
npm run cli -- owner:answer-review
npm run cli -- owner:evidence-bundle
npm run cli -- owner:evidence-intake-record
npm run cli -- release:artifact-manifest
npm run cli -- worktree:packet
npm run cli -- release:review-bundle
npm run cli -- claim:pack
npm run cli -- audit:release-order
npm run cli -- audit:worktree-packet
npm run cli -- audit:release-review-bundle
npm run cli -- audit:status-roadmap
npm run cli -- audit:proof-run-dry
npm run cli -- audit:remote-fallback
npm run cli -- validate
npm run cli -- workspace:check .
```

The CLI is local only.
It does not prove npm package release.
`case:start` creates a started case workspace, not a completed proof artifact.
`case:check` checks completed local evidence, not external adoption or outcomes.
`case:review` checks permissioned intake, not actual transformation proof.
`audit:permissioned-fixture` checks a reviewable local fixture, not a real submitter artifact or external proof.
`case:from-intake` creates a started external case workspace, not completed before/after proof.
`case:from-record` creates a started case workspace from a proof intake record, not completed before/after proof or external adoption proof.
`case:publish-packet` creates a casebook candidate packet, not publication, permission, adoption proof, benchmark proof, or a license decision.
`evidence:check` checks claim-evidence packet structure, not the truth of claims beyond named evidence.
`gap:register` creates a machine-readable open-gate register, not completion proof.
`audit:gap-register` checks that owner, proof, publication, benchmark, and adoption gaps remain visible and bounded.
`audit:gap-register-sync-closure` checks that the strict sync gap stays visible in committed artifacts because current sync proof is runtime-only.
`gate:board` creates a current owner/proof/publication gate board, not completion proof.
`proof:packet` creates a first-proof handoff packet, not external proof.
`proof:intake` creates a first external proof intake kit, not a submitted artifact or completed proof.
`proof:intake-record` creates a schema-shaped fixture record, not a real submitter artifact, permission grant, external proof, or publication.
`proof:intake-check` checks a schema-shaped proof intake record before case creation; it does not grant permission, create external proof, redact files, publish, or prove adoption.
`proof:intake-from-owner-evidence` bridges a reviewed `weak_artifact_permission` owner evidence submission record into a proof intake record; it does not grant permission, create external proof, publish, or close gates.
`audit:proof-intake-record` checks that fixture record and its boundaries.
`audit:proof-intake-check` checks the proof intake check report and unsafe-record failure behavior.
`audit:proof-intake-from-owner-evidence` checks blocked fixture behavior, reviewed-field conversion, proof intake checking, started-case creation, and the no-permission/no-proof/no-closure boundary.
`audit:proof-intake-schema` checks the proof intake schema contract, not permission, external proof, adoption, or publication.
`proof:redaction-packet` creates a proof redaction packet, not redacted files, external proof, permission, complete private-data removal proof, or publication.
`audit:proof-redaction-packet` checks the redaction checklist and no-proof/private-data boundary.
`proof:submission-packet` creates a proof submission packet, not a submitted artifact, permission grant, external proof, closed gate, or publication.
`audit:proof-submission-packet` checks the submission handoff and not-submitted/no-proof boundary.
`proof:acceptance-packet` creates a proof acceptance packet, not an accepted artifact, external proof, transformation, closed gate, or publication.
`audit:proof-acceptance-packet` checks the accept/revise/reject case creation gate and no-accepted-artifact/no-proof boundary.
`proof:readiness` creates a first weak artifact readiness packet, not a submitted artifact, owner decision, external proof, publication, or owner gate bypass.
`audit:proof-readiness` checks that readiness packet and its proof boundary.
`proof:run-packet` creates an operator proof-run packet, not external proof, adoption proof, or publication.
`proof:execution-report` creates a command evidence ledger packet and can read `--execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md` for candidate execution review; neither mode executes commands, approves proof, creates external proof, closes gates, or publishes.
`audit:proof-execution-report` checks the execution report, proof execution record schema, candidate execution review, and no-executed-proof boundary.
`audit:proof-run-dry` checks the proof-run path with a temporary local fixture, not a real external case.
`proof:candidate-packet` creates a first proof candidate packet, not selected proof, external proof, permission, publication, or adoption evidence.
`audit:proof-candidate-packet` checks that candidate selection remains visible without claiming completion.
`license:packet` creates an owner decision packet, not a license choice.
`license:decision-from-owner-answer` creates a blocked bridge report by default, and can record a reviewed `license_or_no_reuse` owner answer as a bounded release decision record candidate; it does not provide legal advice, publish, create external proof, or close gates.
`audit:license-decision-from-owner-answer` checks the reviewed owner answer bridge and no-legal-advice/no-publication boundaries.
`operator:runbook` creates an ecosystem operating path, not external adoption or publication proof.
`ecosystem:resources` creates a local ecosystem resource index, not copied content, external adoption proof, or remote freshness proof.
`benchmark:packet` creates a measurement protocol, not benchmarked productivity, adoption proof, or customer outcome proof.

`adoption:packet` creates `.mimesis/adoption-packets/v0.2-first-adoption.md` from [docs/ADOPTION-PACKET.md](docs/ADOPTION-PACKET.md). `audit:adoption-packet` checks that this is external adoption evidence intake, not adoption proof, and does not create evidence, publish, or close gates.
`first-loop:demo` creates a completed local first-loop demo case, not a real external proof case.
`audit:first-loop` checks the demo with workspace and case checks; it does not prove external adoption, benchmarked productivity, customer outcomes, legal originality, or package publication.
`framework:manifest` creates a local AI-native framework manifest, not adoption proof, benchmark proof, package publication, shipped plugin proof, or a legal originality guarantee.
`audit:framework-manifest-schema` checks the manifest schema contract, not external adoption, package publication, shipped plugin proof, official host compliance, customer outcomes, or legal originality.
`audit:framework-manifest` checks that generated manifest surface, CLI exposure, release-check wiring, and proof boundaries.
`reference:index` creates a local source-first reference pack index, not a source-quality guarantee, external adoption proof, package publication, or permission to copy protected surface.
`audit:reference-index` checks that generated standards index and its copy boundaries.
`plugin:install-packet` creates a local Codex plugin install-readiness handoff, not installation proof, a shipped plugin, official host compliance, Marketplace listing, or external adoption.
`audit:plugin-install-packet` checks that install-readiness handoff and its not-installed boundary.
`plugin:packet` creates a plugin/action release-candidate packet, not a shipped plugin.
`release:evidence-report` creates a publication evidence checklist, not publication, tag creation, npm publish, Marketplace publication, plugin shipment, or external proof.
`audit:release-evidence-report` checks the release evidence report and no-publication boundary.
`publication:evidence-packet` creates `.mimesis/release-evidence/publication-evidence-packet.md` from [docs/PUBLICATION-EVIDENCE-PACKET.md](docs/PUBLICATION-EVIDENCE-PACKET.md). `audit:publication-evidence-packet` checks that this is direct publication evidence intake, not publication proof, and does not publish, stage, commit, push, tag, release, publish to npm, publish a Marketplace action, ship a plugin, or close gates.
`owner:queue` creates an owner action queue, not a license choice, submitted artifact, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-queue` checks the owner action queue and no-decision/no-proof boundary.
`owner:proof-handoff` creates the minimum owner proof handoff for `license_or_no_reuse` and `weak_artifact_permission`, not owner decision, permission grant, proof approval, publication, or gate closure.
`audit:owner-proof-handoff` checks the owner proof handoff and no-decision/no-proof boundary.
`owner:proof-input-template` creates a schema-shaped owner proof input template for `license_or_no_reuse` and `weak_artifact_permission`, not an owner decision, submitted artifact, permission grant, publication, external proof, proof approval, or gate closure.
`owner:proof-input-check` checks that owner proof input record before downstream conversion; `--require-ready` fails until the owner has reviewed and submitted both minimum inputs.
`audit:owner-proof-input` checks the template, checker, CLI, docs, manifests, release order, and no-decision/no-proof boundary.
`owner:proof-input-issue` creates the public owner proof input issue handoff packet, not license choice, permission grant, submitted artifact, external proof, proof approval, publication, or gate closure.
`owner:proof-input-request` creates the owner-facing request packet for `license_or_no_reuse` and `weak_artifact_permission`, not license choice, permission grant, submitted artifact, external proof, proof approval, publication, or gate closure.
`audit:owner-proof-input-request` checks the request packet, CLI, docs, manifests, release order, and no-proof/no-closure boundary.
`owner:proof-input-remote-issue` records the remote owner proof input issue anchor, not owner decision, permission grant, submitted artifact, external proof, publication, adoption evidence, benchmark evidence, or gate closure.
`audit:owner-proof-input-remote-issue` checks the remote issue anchor packet, CLI, docs, manifests, release order, and no-proof/no-closure boundary.
`owner:proof-input-issue-convert` converts a GitHub owner proof input issue body into a draft owner proof input record candidate, not owner decision, permission grant, external proof, publication, or gate closure.
`audit:owner-proof-input-issue-convert` checks the converter, fixture issue, generated draft record/report, CLI, docs, manifests, release order, and no-proof/no-closure boundary.
`owner:proof-input-review` reviews a draft owner proof input record before reviewed-record promotion, not license choice, permission grant, submitted artifact, external proof, proof approval, publication, or gate closure.
`audit:owner-proof-input-review` checks the review report, smoke promotion path, CLI, docs, manifests, release order, and no-proof/no-closure boundary.
`owner:proof-input-split` splits a reviewed owner proof input into downstream owner decision/evidence record candidates; the default template writes a blocked split report only.
`audit:owner-proof-input-split` checks the split report, candidate routing, downstream smoke paths, CLI, docs, manifests, release order, and no-proof/no-closure boundary.
`owner:decision-intake` creates an owner decision intake form, not a license choice, submitted artifact, permission grant, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-decision-intake` checks the owner decision intake form and no-decision/no-proof boundary.
`owner:decision-answer-record` creates a schema-shaped pending owner answer fixture, not a license choice, submitted artifact, permission grant, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-decision-answer-record` checks the owner decision answer record schema, freshness, and no-decision/no-proof boundary.
`owner:answer-review` creates a blocked-gate review from pending owner answers, not a license choice, submitted artifact, permission grant, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-answer-review` checks the owner answer review and blocked-gate boundary.
`owner:evidence-attachment-form` creates an owner evidence attachment form, not attached evidence, a license choice, submitted artifact, permission grant, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-evidence-attachment-form` checks the owner evidence attachment form and no-evidence/no-proof boundary.
`owner:evidence-submission-record` creates a schema-shaped owner evidence submission record, not submitted evidence, attached evidence, a license choice, permission grant, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-evidence-submission-record` checks the owner evidence submission record and no-submitted-evidence/no-proof boundary.
`owner:evidence-submission-check` checks an owner evidence submission record before gate movement, not submitted evidence, attached evidence, publication, external proof, adoption proof, or closed gate.
`audit:owner-evidence-submission-check` checks the owner evidence submission check and unsafe-record rejection path.
`owner:evidence-bundle` creates an owner evidence attachment map, not evidence, a license choice, submitted artifact, permission grant, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-evidence-bundle` checks the owner evidence bundle and no-evidence/no-proof boundary.
`owner:evidence-intake-record` creates a schema-shaped pending owner evidence fixture, not attached evidence, a license choice, submitted artifact, permission grant, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-evidence-intake-record` checks the owner evidence intake record schema, freshness, and no-evidence/no-proof boundary.
`owner:evidence-review` creates a blocked-gate review from pending owner evidence, not attached evidence, a license choice, submitted artifact, permission grant, publication, external proof, benchmark proof, adoption proof, or closed gate.
`audit:owner-evidence-review` checks the owner evidence review and blocked-gate boundary.
`audit:codex-plugin` checks a local Codex plugin scaffold, not a shipped plugin, Marketplace listing, installation proof, or external adoption.
`mcp:resources` creates a local MCP resource index scaffold, not a shipped MCP server or connector install.
`audit:mcp-server` checks the local MCP scaffold, not a long-running server, secret exposure, or external adoption proof.
`mcp:serve` runs a local line-delimited JSON-RPC stdio candidate for resource reads and descriptors.
`audit:mcp-stdio` smoke-tests that candidate; it does not prove external MCP host installation, official compliance, secret exposure, or external adoption.
Tool command execution is disabled through the stdio candidate.
`publish:packet` creates a publish/sync handoff packet, not a commit, push, tag, release, PR, or publication.
`audit:sync:strict-nonwriting` checks the non-writing strict sync boundary described in [docs/PUBLISH-SYNC-GATE.md](docs/PUBLISH-SYNC-GATE.md), so publish-readiness checks can avoid mutating the worktree.
`release:decision-record` creates an owner decision JSON record, not a license choice, publication, commit, push, tag, release, proof, or adoption evidence.
`state:summary` creates a machine-readable current state summary from open gates and owner evidence packets; it is a generation-time snapshot and does not close gates, prove completion, publish, choose a license, create external proof, or prove adoption.
`audit:state-summary` checks the summary source coverage and no-proof/no-closure boundaries.
`audit:state-snapshot-boundary` checks the state snapshot boundary: committed current-state snapshots are not live git freshness proof and must point to `npm run audit:sync:strict`.
`worktree:packet` creates a local dirty worktree review packet, not publication, remote freshness proof, or strict sync closure.
`audit:worktree-packet` checks the worktree review packet and confirms it does not stage, commit, push, publish, or close strict sync.
`release:review-bundle` creates a release review bundle that classifies local dirty worktree scope; it is not a commit, push, tag, release, publication, license choice, remote freshness proof, or strict sync closure.
`audit:release-review-bundle` checks the release review bundle and its no-commit/no-publication boundary.
`goal:completion-audit` creates `.mimesis/completion/goal-completion-audit.json`, an active-goal evidence map that keeps `completionAllowed: false` while open gates remain.
`audit:goal-completion-audit` checks the goal completion audit and confirms it is objective evidence, not completion proof, a gate closure, publication, license choice, external proof, benchmark proof, or adoption proof.
`release:artifact-manifest` creates a local SHA-256 release artifact manifest, not publication, sync, license choice, external proof, or adoption evidence.
`gap:closure-plan` creates a local gap closure plan, not closed gates, completion proof, publication, license choice, external proof, or adoption evidence.
`gate:evidence-packet` creates a local gate evidence packet, not evidence, closed gates, completion proof, publication, license choice, external proof, or adoption evidence.
`gate:closure-readiness` creates a local gate closure readiness report and can also read `--owner-evidence-submission path/to/reviewed-owner-evidence-submission.json --output path/to/closure-readiness-candidate.json`; candidate mode can mark `ownerEvidenceReviewReady` while still keeping `canCloseNow: false`, so it is not submitted evidence, attached evidence, closed gates, completion proof, publication, license choice, external proof, or adoption evidence.
`gate:closure-review` creates a local gate closure review record and can also read `--readiness path/to/closure-readiness-candidate.json --owner-evidence-submission-check path/to/owner-evidence-field-check.md --owner-evidence-submission path/to/reviewed-owner-evidence-submission.json --output path/to/closure-review-candidate.json`; candidate review carries `ownerEvidenceReviewReady` forward while keeping `decision: keep_open`, `closureApproved: false`, and `canCloseNow: false`, so it is not approved gate closure, submitted evidence, attached evidence, closed gates, completion proof, publication, license choice, external proof, or adoption evidence.
`release:execution-packet` creates an owner release handoff, not a commit, push, tag, release, package publish, Marketplace publish, or license choice.
`claim:pack` creates a public copy guardrail, not publication, adoption proof, benchmark proof, legal proof, or certification.
`audit:status-roadmap` checks that status and roadmap pages match the current local v0.1 surface; it does not prove completion or publish anything.

Check the package and root action release-candidate surfaces without publishing:

```bash
npm run audit:package
npm run audit:action
```

These are dry-run and metadata checks.
They do not prove npm registry publication, a GitHub Marketplace listing, tagged release, or external adoption.

If you have the neighboring repos checked out next to this one:

```bash
npm run audit:ecosystem
```

Create a Gemini CLI packet from the current artifact trail:

```bash
npm run adapter:gemini
```

This creates a local packet only.
It does not execute Gemini CLI or prove OAuth/account integration.

Create a Claude Code packet from the current artifact trail:

```bash
npm run adapter:claude
```

Create a Superpowers adapter packet from the current artifact trail:

```bash
npm run adapter:superpowers
npm run audit:superpowers-adapter
```

This creates and checks a local contract packet only.
It does not install Superpowers or prove that a Superpowers skill ran.

License status:
[docs/LICENSE-DECISION.md](docs/LICENSE-DECISION.md)

Owner license decision packet:
[docs/LICENSE-PACKET.md](docs/LICENSE-PACKET.md)

Permissioned external case requirements:
[docs/PERMISSIONED-CASE-PACKET.md](docs/PERMISSIONED-CASE-PACKET.md)

Strong-claim evidence packet:
[docs/EVIDENCE-PACKET.md](docs/EVIDENCE-PACKET.md)

Create a draft evidence packet from a completed local case:

```bash
npm run cli -- evidence:from-case . --out .mimesis/evidence-packets/local-case-draft.md --force
npm run cli -- evidence:check .mimesis/evidence-packets/local-case-draft.md
```

This does not mark the evidence as reviewed and does not prove external adoption.

Record a reviewer decision on an evidence packet:

```bash
npm run cli -- evidence:review .mimesis/evidence-packets/local-case-draft.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
```

This records a decision only.
It does not create evidence or prove external adoption.

Create a bounded claim candidate from reviewed evidence:

```bash
npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md
```

This does not create evidence and does not publish.

Current gate board:
[docs/GATEBOARD.md](docs/GATEBOARD.md)

Current gap register:
[docs/GAP-REGISTER.md](docs/GAP-REGISTER.md)

Current gap closure plan:
[docs/GAP-CLOSURE-PLAN.md](docs/GAP-CLOSURE-PLAN.md)

Current gate evidence packet:
[docs/GATE-EVIDENCE-PACKET.md](docs/GATE-EVIDENCE-PACKET.md)

Current gate closure readiness report:
[docs/GATE-CLOSURE-READINESS.md](docs/GATE-CLOSURE-READINESS.md)

Current first proof candidate packet:
[docs/FIRST-PROOF-CANDIDATE-PACKET.md](docs/FIRST-PROOF-CANDIDATE-PACKET.md)

First v0.2 proof queue:
[docs/V0.2-PROOF-QUEUE.md](docs/V0.2-PROOF-QUEUE.md)

Release readiness check:

```bash
npm run audit:release
```

Generate a local publication handoff packet:

```bash
npm run release:packet
```

This writes `.mimesis/publication-packets/v0.1.md`.

Generate a local first-proof handoff packet:

```bash
npm run proof:packet
```

This writes `.mimesis/proof-packets/v0.2-first-proof.md`.

Generate the first external proof intake kit:

```bash
npm run proof:intake
```

This writes `.mimesis/proof-intake/first-external-proof-kit.md`.
Audit it with `npm run audit:proof-intake`.

Generate the local proof intake fixture record:

```bash
npm run proof:intake-record
```

This writes `.mimesis/proof-intake/fixture-record.json`.
Audit it with `npm run audit:proof-intake-record`.
It is not a real submitter artifact and does not create external proof.

Check the local proof intake fixture record before case creation:

```bash
npm run proof:intake-check
npm run audit:proof-intake-check
```

This writes `.mimesis/proof-intake/fixture-check.md`.
It does not grant permission, create external proof, redact files, publish, or prove adoption.

Generate the blocked proof intake from owner evidence bridge report:

```bash
npm run proof:intake-from-owner-evidence
npm run audit:proof-intake-from-owner-evidence
```

This writes `.mimesis/proof-intake/from-owner-evidence-bridge.md`.
When a reviewed owner evidence submission record has `weak_artifact_permission` submitted, use `npm run cli -- proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json ...` to create a proof intake record.
It does not grant permission, create external proof, publish, or close gates.

Generate the proof redaction packet:

```bash
npm run proof:redaction-packet
npm run audit:proof-redaction-packet
```

This writes `.mimesis/proof-intake/redaction-packet.md`.
It does not redact files, create external proof, grant permission, publish, choose a license, or guarantee complete private-data removal.

Generate the proof submission packet:

```bash
npm run proof:submission-packet
npm run audit:proof-submission-packet
```

This writes `.mimesis/proof-intake/submission-packet.md`.
It does not submit an artifact, create external proof, grant permission, publish, choose a license, or close the external-artifact gate.

Generate the proof acceptance packet:

```bash
npm run proof:acceptance-packet
npm run audit:proof-acceptance-packet
```

This writes `.mimesis/proof-intake/acceptance-packet.md`.
It does not accept an artifact, create external proof, grant permission, run a transformation, publish, choose a license, or close the external-artifact gate.

Audit the proof intake schema contract:

```bash
npm run audit:proof-intake-schema
```

This checks `spec/proof-intake.schema.json`.
It does not create external proof, grant permission, prove adoption, choose a license, or publish a case.

Generate the first weak artifact readiness packet:

```bash
npm run proof:readiness
```

This writes `.mimesis/proof-runs/readiness.md`.
Audit it with `npm run audit:proof-readiness`.
It does not create external proof, choose a license, bypass owner gates, publish, or prove adoption.

Generate the first proof candidate packet:

```bash
npm run proof:candidate-packet
npm run audit:proof-candidate-packet
```

This writes `.mimesis/proof-candidates/first-candidate.md`.
It is a candidate selection packet only.
It does not create external proof, select a candidate, grant permission, publish, choose a license, or prove external adoption.

Generate the first proof-run operator packet:

```bash
npm run proof:run-packet
```

This writes `.mimesis/proof-runs/v0.2-first-run.md`.
Audit it with `npm run audit:proof-run`.

Generate the proof execution report:

```bash
npm run proof:execution-report
npm run audit:proof-execution-report
```

This writes `.mimesis/proof-runs/execution-report.md`.
After a real operator run, review a supplied proof execution record without approving proof:

```bash
npm run cli -- proof:execution-report --execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md
```

Candidate execution review can show `candidateEvidenceReviewReady: true`, but it keeps `proofApproved: false`, `publicClaimApproved: false`, and `completionAllowed: false`.
It is a command evidence ledger for a future real proof run.
It does not execute commands, create external proof, run a transformation, publish, choose a license, or prove adoption.

Run the proof-run dry audit:

```bash
npm run audit:proof-run-dry
```

This writes `.mimesis/proof-runs/dry-run-report.md` from a temporary local fixture.
It now rehearses both the permissioned-intake lane and the owner-evidence bridge lane through reviewed evidence and bounded claim candidate.
It does not create external proof or run `release:check:public`.

Generate a local casebook candidate packet:

```bash
npm run case:publish-packet
```

This writes `.mimesis/case-publication-packets/current-casebook-candidate.md`.
Audit it with `npm run audit:case-publication`.

Generate a local owner license decision packet:

```bash
npm run license:packet
```

This writes `.mimesis/license-packets/owner-decision.md`.

Generate the current ecosystem operator runbook:

```bash
npm run operator:runbook
```

This writes `.mimesis/operator-runbooks/current-runbook.md`.
Audit it with `npm run audit:operator-runbook`.

Generate the local ecosystem resource packet:

```bash
npm run ecosystem:resources
```

This writes `.mimesis/ecosystem-resources/current-resource-packet.md`.
Audit it with `npm run audit:ecosystem-resources`.

Generate a benchmark/adoption measurement packet:

```bash
npm run benchmark:packet
```

This writes `.mimesis/benchmark-packets/v0.2-first-benchmark.md`.
Audit it with `npm run audit:benchmark-packet`.

Generate an external adoption evidence intake packet; this is not adoption proof:

```bash
npm run adoption:packet
```

This writes `.mimesis/adoption-packets/v0.2-first-adoption.md`.
Audit it with `npm run audit:adoption-packet`.
It does not prove external adoption, create evidence, publish, or close gates.

Generate a local Codex plugin install-readiness packet:

```bash
npm run plugin:install-packet
npm run audit:plugin-install-packet
```

This writes `.mimesis/plugin-install-packets/codex-local.md`.
It does not install the plugin, publish, ship a plugin, prove official host compliance, or prove external adoption.

Generate a local plugin/action release-candidate packet:

```bash
npm run plugin:packet
```

This writes `.mimesis/plugin-release-packets/v0.1-action-candidate.md`.
Audit the local Codex plugin scaffold with `npm run audit:codex-plugin`.
The scaffold is local prototype evidence, not a shipped plugin or Marketplace listing.

Generate and audit the local MCP resource index scaffold:

```bash
npm run mcp:resources
npm run audit:mcp-server
npm run audit:mcp-stdio
```

This writes `.mimesis/mcp/resource-index.json`.
It is local prototype evidence, not a shipped MCP server or connector installation.
The stdio candidate supports `initialize`, `resources/list`, `resources/read`, `tools/list`, and `prompts/list` over line-delimited JSON-RPC.
It does not execute tool commands.

Generate the current gate board:

```bash
npm run gate:board
```

This writes `.mimesis/gates/current-gateboard.md`.
Audit it with `npm run audit:gateboard`.

Generate the current gap register:

```bash
npm run gap:register
npm run audit:gap-register
npm run audit:gap-register-sync-closure
```

This writes `.mimesis/gaps/current-gap-register.json`.
The strict sync gap stays visible in the committed register because `.mimesis/sync-status.md` is a local report that can become stale after commit or push.
The committed gate board avoids volatile sync snapshot lines and points to the runtime-only strict sync audit instead.
Use the non-writing strict sync check, `npm run audit:sync:strict`, as the runtime-only proof of current local upstream sync.
It does not prove completion, publish, choose a license, create external proof, or prove adoption.

Generate the current gap closure plan:

```bash
npm run gap:closure-plan
npm run audit:gap-closure-plan
```

This writes `.mimesis/gaps/closure-plan.json`.
It does not close gates, prove completion, publish, stage, commit, push, tag, release, choose a license, create external proof, or prove adoption.

Generate the current gate evidence packet:

```bash
npm run gate:evidence-packet
npm run audit:gate-evidence-packet
```

This writes `.mimesis/gates/evidence-packet.md`.
It does not close gates, create evidence, prove completion, publish, stage, commit, push, tag, release, choose a license, create external proof, or prove adoption.

Generate the current gate closure readiness report:

```bash
npm run gate:closure-readiness
npm run audit:gate-closure-readiness
```

This writes `.mimesis/gates/closure-readiness.json`.
With a real reviewed owner evidence submission record, write a separate candidate report:

```bash
npm run cli -- gate:closure-readiness --owner-evidence-submission path/to/reviewed-owner-evidence-submission.json --output path/to/closure-readiness-candidate.json
```

Candidate readiness can show `ownerEvidenceReviewReady: true`; it still keeps `canCloseNow: false`.
It does not close gates, submit evidence, attach evidence, prove completion, publish, stage, commit, push, tag, release, choose a license, create external proof, or prove adoption.

Generate the gate closure review record:

```bash
npm run gate:closure-review
npm run audit:gate-closure-review
```

With a candidate readiness/check/record set, write a separate candidate review:

```bash
npm run cli -- gate:closure-review --readiness path/to/closure-readiness-candidate.json --owner-evidence-submission-check path/to/owner-evidence-field-check.md --owner-evidence-submission path/to/reviewed-owner-evidence-submission.json --output path/to/closure-review-candidate.json
```

Candidate review can show `ownerEvidenceReviewReady: true`; it still keeps `decision: keep_open`, `closureApproved: false`, and `canCloseNow: false`.

This writes `.mimesis/gates/closure-review.json`.
It does not approve gate closure, close gates, submit evidence, attach evidence, prove completion, publish, stage, commit, push, tag, release, choose a license, create external proof, or prove adoption.

Generate a local publish/sync handoff packet:

```bash
npm run publish:packet
```

This writes `.mimesis/publish-packets/local-sync-handoff.md`.
Audit it with `npm run audit:publish-packet`.

Generate an owner release decision record:

```bash
npm run release:decision-record
```

This writes `.mimesis/release-decisions/owner-decision-record.json`.
Audit it with `npm run audit:release-decision-record`.
It does not choose a license, stage, commit, push, tag, release, publish, create proof, or prove adoption.

Generate a local release evidence report:

```bash
npm run release:evidence-report
```

This writes `.mimesis/release-evidence/v0.1-report.md`.
Audit it with `npm run audit:release-evidence-report`.
It lists required publication evidence for commit, push, tag, npm, Marketplace, plugin, external proof, benchmark, and adoption claims.
It does not publish, stage, commit, push, tag, release, publish to npm, publish a GitHub Marketplace action, choose a license, ship a plugin, create external proof, or prove adoption.

Generate a direct publication evidence packet:

```bash
npm run publication:evidence-packet
```

This writes `.mimesis/release-evidence/publication-evidence-packet.md`.
Audit it with `npm run audit:publication-evidence-packet`.
It does not publish, stage, commit, push, create a tag, publish to npm, publish a GitHub Marketplace action, ship a plugin, or close gates.

Generate an owner action queue:

```bash
npm run owner:queue
```

This writes `.mimesis/owner-actions/current-action-queue.md`.
Audit it with `npm run audit:owner-queue`.
It lists the next owner actions for license, weak artifact, before/after case, strict sync, package, action, plugin, benchmark, and adoption gates.
It does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Generate an owner decision intake:

```bash
npm run owner:decision-intake
```

This writes `.mimesis/owner-actions/decision-intake.md`.
Audit it with `npm run audit:owner-decision-intake`.
It turns the owner action queue into fillable owner-answer fields for license, weak artifact permission, publication scope, package/action/plugin scope, benchmark/adoption scope, and strict sync intent.
It does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Generate an owner decision answer record:

```bash
npm run owner:decision-answer-record
```

This writes `.mimesis/owner-actions/fixture-answer-record.json`.
Audit it with `npm run audit:owner-decision-answer-record`.
It turns the owner decision intake into a schema-shaped fixture with pending owner answers.
It does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Generate an owner answer review:

```bash
npm run owner:answer-review
```

This writes `.mimesis/owner-actions/answer-review.md`.
Audit it with `npm run audit:owner-answer-review`.
It shows `blocked_pending_owner_answers` and `ready to proceed: no` while owner answers remain pending.
It does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Generate an owner evidence bundle:

```bash
npm run owner:evidence-bundle
```

This writes `.mimesis/owner-actions/evidence-bundle.md`.
Audit it with `npm run audit:owner-evidence-bundle`.
It maps pending owner answer fields to evidence attachments, commands, and stop conditions.
It is not evidence and does not choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Generate an owner evidence intake record:

```bash
npm run owner:evidence-intake-record
```

This writes `.mimesis/owner-actions/fixture-evidence-record.json`.
Audit it with `npm run audit:owner-evidence-intake-record`.
It turns the owner evidence bundle into schema-shaped pending owner evidence attachments.
It does not attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Generate an owner evidence review:

```bash
npm run owner:evidence-review
```

This writes `.mimesis/owner-actions/evidence-review.md`.
Audit it with `npm run audit:owner-evidence-review`.
It turns pending owner evidence attachments into a readable blocked-gate review.
It does not attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Generate an owner evidence attachment form:

```bash
npm run owner:evidence-attachment-form
```

This writes `.mimesis/owner-actions/evidence-attachment-form.md`.
Audit it with `npm run audit:owner-evidence-attachment-form`.
It creates owner-provided evidence slots for the pending gates.
It does not attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Generate the owner proof handoff:

```bash
npm run owner:proof-handoff
```

This writes `.mimesis/owner-actions/proof-run-handoff.md`.
Audit it with `npm run audit:owner-proof-handoff`.
It narrows the owner ask to `license_or_no_reuse` and `weak_artifact_permission`.
It does not choose a license, grant permission, submit an artifact, create external proof, approve proof, publish, close gates, or prove completion.

Generate and check the owner proof input template:

```bash
npm run owner:proof-input-template
npm run owner:proof-input-check
npm run audit:owner-proof-input
```

This writes `.mimesis/owner-actions/proof-input-template.json` and `.mimesis/owner-actions/fixture-proof-input-check.md`.
It keeps both minimum inputs pending until the owner reviews and submits them.
It does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, or close gates.

Generate the owner proof input issue packet:

```bash
npm run owner:proof-input-issue
npm run audit:owner-proof-input-issue
```

This writes `.mimesis/owner-actions/proof-input-issue-packet.md`.
It connects `.github/ISSUE_TEMPLATE/owner-proof-input.yml` to the local owner proof input path.
It is a handoff only, not license choice, permission grant, proof approval, publication, or gate closure.

Generate the owner proof input request packet:

```bash
npm run owner:proof-input-request
npm run audit:owner-proof-input-request
```

This writes `.mimesis/owner-actions/proof-input-request.md`.
It gives the owner one sendable request for `license_or_no_reuse` and `weak_artifact_permission`.
It is a request only, not license choice, permission grant, submitted artifact, external proof, proof approval, publication, or gate closure.

Generate the owner proof input remote issue anchor before treating a GitHub issue as owner input:

```bash
npm run owner:proof-input-remote-issue
npm run audit:owner-proof-input-remote-issue
```

This writes `.mimesis/owner-actions/remote-proof-input-issue-anchor.md`.
It records https://github.com/svy04/mimesis-engineering/issues/7 as the current owner input anchor.
It is an anchor only, not owner decision, permission grant, submitted artifact, external proof, proof approval, publication, adoption evidence, benchmark evidence, or gate closure.

Run the owner proof input issue convert step to turn an issue body into a local record candidate:

```bash
npm run owner:proof-input-issue-convert
npm run audit:owner-proof-input-issue-convert
```

This writes `.mimesis/owner-actions/fixture-owner-proof-input-issue-record.json` and `.mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md` from `.mimesis/owner-actions/fixture-owner-proof-input-issue.md`.
For a real reviewed owner issue, run `npm run cli -- owner:proof-input-issue-convert path/to/owner-proof-input-issue.md --output path/to/owner-proof-input-record.json --report path/to/report.md --status reviewed --require-complete`.
It is a conversion candidate only, not license choice, permission grant, submitted artifact, external proof, proof approval, publication, or gate closure.

Run the owner proof input review before treating a converted draft record as reviewed:

```bash
npm run owner:proof-input-review
npm run audit:owner-proof-input-review
```

This writes `.mimesis/owner-actions/fixture-proof-input-review.md` for the default fixture record.
For a real owner proof input record, run `npm run cli -- owner:proof-input-review path/to/owner-proof-input-record.json --write-report path/to/review.md --output-record path/to/reviewed-owner-proof-input-record.json --approve --require-approvable`.
It reviews fields only; it does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, or close gates.

Run the owner proof input split for downstream record candidates:

```bash
npm run owner:proof-input-split
npm run audit:owner-proof-input-split
```

This writes `.mimesis/owner-actions/proof-input-split-report.md` for the default not-ready template.
For a real reviewed owner proof input, run `npm run cli -- owner:proof-input-split path/to/owner-proof-input.json --output-dir path/to/split-output --require-ready`.
It does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, or close gates.

Generate an owner evidence submission record:

```bash
npm run owner:evidence-submission-record
```

This writes `.mimesis/owner-actions/fixture-evidence-submission-record.json`.
Audit it with `npm run audit:owner-evidence-submission-record`.
It records `not_submitted_owner_evidence`.
It does not submit evidence, attach evidence, choose a license, collect an artifact, grant permission, publish, create external proof, prove adoption, or close gates.

Check an owner evidence submission record before gate movement:

```bash
npm run owner:evidence-submission-check
npm run audit:owner-evidence-submission-check
```

This writes `.mimesis/owner-actions/fixture-evidence-submission-check.md`.
It does not submit evidence, attach evidence, publish, create external proof, prove adoption, or close gates.

Check one field after the owner supplies a permissioned weak artifact record:

```bash
npm run cli -- owner:evidence-submission-check path/to/owner-evidence-submission-record.json --require-field weak_artifact_permission
```

This is a field-level readiness check for case review. It is not gate closure, external proof, publication, adoption evidence, or permission by itself.

Generate the current state summary:

```bash
npm run state:summary
npm run audit:state-summary
npm run audit:state-snapshot-boundary
```

This is a state snapshot boundary check.
The generated `.mimesis/state/current-state.json` records git status at generation time only.
A committed snapshot can go stale after commit or push; use `npm run audit:sync:strict` for live sync evidence.

This writes `.mimesis/state/current-state.json`.
It summarizes the current gap register, closure plan, gate board, owner action queue, and release evidence report.
It does not close gates, prove completion, publish, choose a license, create external proof, or prove adoption.

Generate a local release artifact manifest:

```bash
npm run release:artifact-manifest
```

This writes `.mimesis/release-artifacts/v0.1-manifest.json`.
Audit it with `npm run audit:release-artifact-manifest`.
It records selected release-review files with SHA-256 hashes.
It does not publish, stage, commit, push, tag, release, choose a license, create external proof, or prove adoption.

Generate a dirty worktree review packet before treating local changes as reviewed:

```bash
npm run worktree:packet
npm run audit:worktree-packet
```

This writes `.mimesis/worktree/review-packet.json`.
It records tracked changes, untracked roots, source git commands, and review boundaries.
It does not stage, commit, push, tag, release, publish, prove remote freshness, or close strict sync.

Generate a release review bundle before treating local changes as commit-ready:

```bash
npm run release:review-bundle
npm run audit:release-review-bundle
```

This writes `.mimesis/release-review/v0.1-bundle.json`.
It classifies the dirty worktree into review groups and a required review sequence.
It does not stage, commit, push, tag, release, publish, choose a license, prove remote freshness, or close strict sync.

Generate an active-goal completion audit before any completion claim:

```bash
npm run goal:completion-audit
npm run audit:goal-completion-audit
```

This writes `.mimesis/completion/goal-completion-audit.json`.
It maps objective evidence and open gates for the active goal.
It does not mark the active goal complete, close gates, publish, choose a license, create external proof, prove benchmarked productivity, or prove adoption.

Generate an owner release execution handoff:

```bash
npm run release:execution-packet
```

This writes `.mimesis/release-execution/v0.1-owner-handoff.md`.
Audit it with `npm run audit:release-execution`.

Generate a bounded public claim pack:

```bash
npm run claim:pack
```

This writes `.mimesis/claim-packs/public-v0.1.md`.
Audit it with `npm run audit:claim-pack`.

Audit the first external proof path:

```bash
npm run audit:secrets
npm run audit:activation
npm run audit:license-packet
npm run audit:codex-plugin
npm run audit:mcp-server
npm run audit:mcp-stdio
npm run audit:plugin-packet
npm run audit:publish-packet
npm run audit:claim-pack
npm run audit:completion-row-count
npm run audit:release-order
npm run audit:owner-decision-intake
npm run audit:owner-decision-answer-record
npm run audit:owner-answer-review
npm run audit:owner-evidence-bundle
npm run audit:owner-evidence-intake-record
npm run audit:release-artifact-manifest
npm run audit:worktree-packet
npm run audit:release-review-bundle
npm run audit:status-roadmap
npm run audit:gap-register
npm run audit:release-execution
npm run audit:ecosystem-resources
npm run audit:gateboard
npm run audit:proof-intake-schema
npm run audit:spec-index
npm run audit:proof-intake-record
npm run audit:proof-intake
npm run audit:proof-run
npm run audit:proof-run-dry
npm run audit:operator-runbook
npm run audit:proof-packet
npm run audit:proof-queue
npm run audit:permissioned-fixture
npm run audit:case-publication
npm run audit:benchmark-packet
npm run audit:adoption-packet
npm run audit:publication-evidence-packet
npm run audit:goal-completion-audit
npm run audit:sync:strict-nonwriting
```

Full local release preflight:

```bash
npm run release:check
```

If the neighboring repos are checked out beside this one:

```bash
npm run release:check:workspace
```

If public GitHub repository metadata can be read:

```bash
npm run release:check:public
```

This adds read-only visibility checks and a forced fallback path for `svy04/mimesis-engineering`, `svy04/mimesis-canvas`, and `svy04/mimesis-casebook`.
It does not prove the remotes contain the current local worktree.

Check the fallback directly:

```bash
npm run audit:remote-fallback
```

This forces the remote audit off the `gh` path and verifies public repository visibility through the fallback path.

Secret safety audit:

```bash
npm run audit:secrets
```

This writes `.mimesis/security/secret-safety-report.md`.
It is a local heuristic guardrail, not production-grade security proof.

Strict publish readiness:

```bash
npm run release:ready:publish
```

This requires the public preflight plus a clean worktree synced with upstream.
It does not choose a license or publish anything.

## The MIMESIS Loop

| Letter | Step | Question |
| --- | --- | --- |
| M | Map the field | What artifacts define this space? |
| I | Identify strong artifacts | Which examples are worth studying? |
| M | Model their structure | What makes them work? |
| E | Extract patterns | What can transfer without copying? |
| S | Synthesize your version | What should your artifact become? |
| I | Inspect the boundary | Where could this become shallow, copied, or overclaimed? |
| S | Ship proof | What evidence or case note proves the change? |

## The Boundary

Weak Mimesis copies surface.
Strong Mimesis extracts structure.

Do not:

- copy sentences
- clone layouts
- hide references
- borrow authority without proof
- claim outcomes you have not shown

Extract:

- problem structure
- trust devices
- user flow
- claim boundary
- proof rhythm
- failure handling

No proof, no claim.

Read:

- [docs/ORIGINALITY-BOUNDARY.md](docs/ORIGINALITY-BOUNDARY.md)
- [PROOF-BOUNDARY.md](PROOF-BOUNDARY.md)

## Casebook

- [Case 001: Mimesis on Mimesis](cases/001-mimesis-on-mimesis.md)
- [Case 002: Blog Homepage Mimesis](cases/002-blog-homepage-mimesis.md)
- [Case 003: GitHub Profile Mimesis](cases/003-github-profile-mimesis.md)
- [Case 004: When Mimesis Becomes Shallow Copying](cases/004-when-mimesis-becomes-shallow-copying.md)
- [Case 005: Public Source Specimen - AI App Builder Landing Page](cases/005-lovable-ai-app-builder-public-source-specimen.md)
- [External Casebook Index](cases/EXTERNAL-CASEBOOK.md)
- [Mimesis Casebook](https://github.com/svy04/mimesis-casebook)

## Reference Packs

- [Reference Pack Index](reference-packs/README.md)
- [GitHub README](reference-packs/github-readme.md)
- [Landing Page](reference-packs/landing-page.md)
- [Product Page](reference-packs/product-page.md)
- [Blog Post](reference-packs/blog-post.md)
- [AI Workflow](reference-packs/ai-workflow.md)
- [Research Note](reference-packs/research-note.md)
- [Profile Positioning](reference-packs/profile-positioning.md)

## Examples

- [Example Index](examples/README.md)
- [GitHub README Mimesis](examples/github-readme.md)
- [Landing Page Mimesis](examples/landing-page.md)
- [Research Paper Mimesis](examples/research-paper.md)
- [Product Workflow Mimesis](examples/product-workflow.md)
- [Blog Homepage Mimesis](examples/blog-homepage.md)
- [Permissioned Case Intake Fixture](examples/permissioned-case-intake.md)

## Contribute

Real contributions only.

You can:

- submit a weak artifact
- submit a reference pack
- submit a before/after case
- report where the method feels confusing
- improve the boundary

Do not:

- ask for fake stars
- post copied comments
- create artificial amplification
- submit copied material
- invent proof

Start with [CONTRIBUTING.md](CONTRIBUTING.md).

## Status

- [Project Status](STATUS.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)
- [License Status](LICENSE.md)
- [Security](SECURITY.md)

## Related

- [Mimesis Canvas](https://github.com/svy04/mimesis-canvas)
- [Mimesis Casebook](https://github.com/svy04/mimesis-casebook)
- [Concept hub](https://svy04.github.io/mimesis-engineering/)
- [Prompt pack](https://svy04.github.io/posts/024-mimesis-prompts/)
- [Proof boundary](https://svy04.github.io/proof/)
- [Artifact-level Mimesis](https://svy04.github.io/posts/artifact-level-mimesis/)
