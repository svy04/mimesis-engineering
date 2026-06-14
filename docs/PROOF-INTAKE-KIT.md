# Proof Intake Kit

Status: local first-proof intake handoff.

`proof:intake` generates the submitter-facing kit for the first v0.2 permissioned external weak artifact.

## Command

```bash
npm run proof:intake
```

or:

```bash
npm run cli -- proof:intake
```

This writes:

```text
.mimesis/proof-intake/first-external-proof-kit.md
```

## Purpose

The kit gives a submitter one place to see:

- what artifact to bring
- what permission status to declare
- what redaction requirements to name
- what proof boundary to set
- what command path the operator will run
- what the case is allowed and not allowed to claim

The structured intake contract is:

[Proof Intake Schema](PROOF-INTAKE-SCHEMA.md)

The local fixture record example is:

[Proof Intake Record](PROOF-INTAKE-RECORD.md)

## Required Flow

```bash
npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md
npm run cli -- case:check path/to/started-case
npm run cli -- evidence:check path/to/evidence-packet.md --require-reviewed --write-report
npm run release:check:public
```

## Boundary

This kit does not create external proof, choose a license, grant permission, run a transformation, publish a case, prove adoption, prove benchmarked productivity, prove customer outcomes, or prove legal originality.

It only packages the first-proof intake requirements so a real permissioned external weak artifact can be submitted safely.

## Audit

Run:

```bash
npm run audit:proof-intake
npm run audit:proof-intake-record
npm run audit:proof-intake-schema
```

The audit checks that the generated kit includes submitter fields, redaction boundary, required command path, evidence requirements, stop conditions, and allowed/disallowed claims.
The record audit checks that the local fixture can become a schema-shaped JSON record without becoming external proof.
The schema audit checks the local JSON Schema contract for a proof intake record.
