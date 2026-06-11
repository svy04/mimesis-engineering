# Roadmap

This roadmap is proof-gated.
Items move forward when there is an artifact, case, validator, or real integration to support the claim.

## v0.1 - Public Framework Surface

Status: current working version.

Includes:

- README activation surface
- activation surface audit
- spec index audit with `npm run audit:spec-index`
- first-loop demo generator and audit
- framework manifest generator and audit
- framework manifest schema and audit
- `.mimesis` protocol
- templates
- starter reference packs
- reference pack index generator and audit
- source-first protocol
- starter examples
- case notes
- adapter contracts
- plugin shapes
- local validator
- case starter
- case evidence checker
- permissioned case intake reviewer
- permissioned case fixture audit
- permissioned intake case starter
- proof intake record case starter
- casebook candidate packet generator
- strong-claim evidence packet gate
- draft evidence packet generator from completed local case evidence
- named evidence review decision writer
- bounded claim candidate generator from reviewed evidence
- secret safety audit
- current gate board
- gap register
- gap closure plan
- gate evidence packet
- gate closure readiness
- gate closure review
- workspace checker
- package release-candidate audit
- root GitHub Action release-candidate metadata
- local Codex plugin scaffold
- local MCP server scaffold
- local MCP stdio runtime candidate
- Superpowers adapter
- plugin/action release-candidate packet
- read-only remote ecosystem visibility audit
- remote visibility fallback audit
- publish sync gate
- publish/sync handoff packet
- owner release execution handoff
- release evidence report
- publication evidence packet with `publication:evidence-packet`, `audit:publication-evidence-packet`, `docs/PUBLICATION-EVIDENCE-PACKET.md`, and `.mimesis/release-evidence/publication-evidence-packet.md`
- owner action queue
- owner decision intake
- owner decision answer record
- owner answer review
- owner proof handoff
- owner proof input
- owner proof input issue
- owner proof input request
- owner proof input remote issue
- owner proof input issue convert
- owner proof input review
- owner proof input split
- owner evidence attachment form
- owner evidence submission record
- owner evidence submission check
- owner evidence bundle
- owner evidence intake record
- owner evidence review
- current state summary
- worktree review packet with `worktree:packet` and `audit:worktree-packet`
- release review bundle with `release:review-bundle` and `audit:release-review-bundle`
- goal completion audit with `goal:completion-audit`, `audit:goal-completion-audit`, `docs/GOAL-COMPLETION-AUDIT.md`, and `.mimesis/completion/goal-completion-audit.json`
- release artifact manifest
- status roadmap sync audit
- public claim pack
- release check order audit
- Superpowers adapter with `adapter:superpowers`, `audit:superpowers-adapter`, `docs/SUPERPOWERS-ADAPTER.md`, `adapters/superpowers.md`, and `.mimesis/adapter-packets/superpowers.md`
- local release preflight
- completion audit matrix
- owner license decision packet
- v0.2 proof queue
- v0.2 first-proof handoff packet
- first external proof intake kit
- proof intake fixture record
- proof intake schema contract
- proof intake check report
- proof redaction packet
- proof submission packet
- proof acceptance packet
- first proof candidate packet
- first proof-run operator packet
- proof execution report with proof execution record candidate review
- proof-run dry audit
- ecosystem operator runbook
- ecosystem resource packet
- benchmark/adoption measurement packet
- adoption packet with `adoption:packet`, `audit:adoption-packet`, `docs/ADOPTION-PACKET.md`, and `.mimesis/adoption-packets/v0.2-first-adoption.md`
- proof boundary

## v0.2 - First Permissioned External Proof Loop

Goal:
Prove the method on one user-submitted, permissioned, or clearly redacted external weak artifact.

Candidate work:

- user-submitted or permissioned external weak artifact
- replace the local first-loop fixture with a permissioned external first-loop case
- replace the local reviewable fixture with a real permissioned or clearly redacted submitter artifact
- weak README to stronger README
- richer research-note pack
- evidence packet for any stronger public claim
- secret safety audit before any publication-ready claim
- reviewed external adoption evidence packet before any adoption claim; not adoption proof until reviewed
- public claim pack before release notes or public posts
- generated current gate board for owner/proof/publication decisions
- generated gap register for remaining owner, proof, publication, benchmark, and adoption gates
- generated gap closure plan for bounded evidence steps without claiming closed gates
- generated gate evidence packet for routing open gates to evidence packet requirements without creating evidence
- generated gate closure readiness report before treating any open gate as closable
- proof queue exit path: `case:review` -> `case:from-intake` -> `case:check` -> `evidence:from-case` -> `evidence:review` -> `evidence:check` -> `claim:from-evidence`
- record-based proof queue rehearsal path: `proof:intake-record` -> `case:from-record` -> `case:check`
- casebook publication path: `case:check` -> `case:publish-packet` -> `claim:pack`
- generated first-proof handoff packet for the candidate operator
- generated first external proof intake kit for the submitter
- generated schema-shaped proof intake fixture record for local path rehearsal
- local proof intake schema contract before accepting a structured intake record
- audited `spec/README.md` index before treating local schemas as discoverable AI-native contracts
- generated proof intake check report before treating a structured intake record as case-ready; it does not grant permission, does not create external proof, does not redact files, does not publish, and does not prove adoption
- generated proof redaction packet before proof intake review
- generated proof submission packet before accepting the first real weak artifact
- generated proof acceptance packet before creating the first real weak-artifact case workspace
- generated proof-run packet for the operator command path
- generated first proof candidate packet for selecting one weak artifact without claiming proof
- generated proof execution report and candidate review mode for supplied command evidence during the first real proof run
- local proof-run dry audit for the command path
- generated ecosystem operator runbook for engineering/canvas/casebook flow
- generated ecosystem resource packet before choosing canvas or casebook examples
- generated benchmark/adoption measurement packet before any productivity claim
- generated owner license decision packet
- generated plugin/action release-candidate packet
- generated owner release execution handoff
- generated release evidence report before public release, package, action, plugin, proof, benchmark, or adoption claims
- generated publication evidence packet before treating npm, Marketplace, action, or shipped-plugin claims as reviewable
- generated owner action queue before asking the owner for license, weak artifact, publication, package, action, plugin, benchmark, or adoption decisions
- generated owner decision intake before recording owner license, weak artifact permission, publication, package/action/plugin, benchmark/adoption, or strict sync answers
- generated owner decision answer record before treating any owner answer as machine-readable gate evidence
- generated owner answer review before treating pending owner answers as gate movement
- generated license decision from owner answer bridge before treating a reviewed `license_or_no_reuse` answer as a release decision record candidate
- generated owner evidence attachment form before asking owner-provided evidence to move gates
- generated owner proof handoff before treating `license_or_no_reuse` and `weak_artifact_permission` as submitted owner inputs
- generated owner proof input template/check before treating the minimum owner proof inputs as reviewed, submitted, or ready for downstream conversion
- generated owner proof input issue before treating public issue intake as owner decision, permission grant, proof, publication, or gate closure
- generated owner proof input request before treating owner-facing requests as submitted owner input, permission, proof, publication, or gate closure
- generated owner proof input remote issue before treating GitHub issue #7 as owner decision, submitted artifact, proof, publication, adoption evidence, benchmark evidence, or gate closure
- generated owner proof input issue convert before treating issue markdown as reviewed owner decision, permission grant, proof, publication, or gate closure
- generated owner proof input review before treating a draft owner proof input record as reviewed or downstream-ready
- generated owner proof input split before treating a single owner proof input record as downstream owner decision/evidence records
- generated owner evidence submission record before treating missing owner evidence as submitted evidence
- generated owner evidence submission check before treating an owner evidence submission record as gate-moving evidence
- generated goal completion audit before treating the active objective as complete
- generated owner evidence bundle before treating evidence attachment requirements as evidence
- generated owner evidence intake record before treating any owner evidence attachment as machine-readable gate evidence
- generated owner evidence review before treating pending owner evidence as gate movement
- generated current state summary before treating open gates as closed or hidden
- generated gate closure readiness report before treating missing owner evidence as resolved, including candidate-mode `ownerEvidenceReviewReady` checks from reviewed owner evidence submission records
- generated gate closure review record before treating any open gate as approved for closure, including candidate-mode review records that carry `ownerEvidenceReviewReady` without closure approval
- generated worktree review packet before treating dirty local changes as reviewed, publishable, or synced
- generated release review bundle before treating dirty local changes as staged, committed, publishable, or synced
- license decision

Completion boundary:
No v0.2 claim until the before/after case and boundary check are public or clearly redacted.
Public-source specimens are useful, but they do not replace permissioned external proof.

## v0.3 - Operator Kit

Goal:
Make Mimesis easier to run across tools without hiding the artifact trail.

Candidate work:

- Codex workflow helper
- turn the local Codex scaffold into an installable, documented plugin release candidate
- turn the local MCP stdio candidate into an installable server package only after the resource index has a case note proving use in an external host
- reusable GitHub Action package
- npm package release decision
- MCP host installation proof
- pack generator
- case submission review flow

Completion boundary:
No shipped-plugin claim until a package or action exists and has a case note proving use.
