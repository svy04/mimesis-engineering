# Proof Intake Schema

Status: local schema contract for the first permissioned external weak-artifact intake record.

The proof intake schema describes the required shape of a structured intake record before the first v0.2 external proof loop.
It exists so agents, issue-form adapters, local CLI commands, and future plugins can preserve permission, redaction, safety, and claim boundaries without relying on hidden assumptions.

## Files

- Schema: `spec/proof-intake.schema.json`
- Intake kit: `.mimesis/proof-intake/first-external-proof-kit.md`
- Fixture record: `.mimesis/proof-intake/fixture-record.json`
- Submitter template: `templates/permissioned-case-intake.md`
- Audit: `tools/audit-proof-intake-schema.mjs`

## Run

```bash
npm run audit:proof-intake-schema
```

or:

```bash
npm run cli -- audit:proof-intake-schema
```

The audit checks:

- the schema is valid JSON
- the schema declares JSON Schema draft 2020-12
- the schema closes the intake record object
- required intake fields are explicit
- publication preference is limited to `public`, `anonymized`, `redacted`, or `private only`
- safety confirmation requires `noSecrets`, `noPrivateCustomerData`, and `noCopiedProtectedMaterial`
- docs, package scripts, CLI exposure, and release preflight wiring exist

## Required Shape

The intake record must include:

- identity: `schemaVersion`, `status`, and `submitter`
- artifact ownership: `startingArtifact`, `artifactOwner`, and `permissionStatus`
- publication boundary: `publicationPreference` and `redactionRequirements`
- standards: `referencesStudied`
- transformation intent: `desiredTransformation`
- claim boundary: `proofBoundary` and `prohibitedClaims`
- safety confirmation: `noSecrets`, `noPrivateCustomerData`, and `noCopiedProtectedMaterial`

## Boundary

This is local schema evidence.

It does not create external proof.
It does not grant permission.
It does not prove external adoption.
It does not choose a license.
It does not publish a case.
It does not prove benchmarked productivity, customer outcomes, legal originality, package publication, or shipped plugins.

The schema exists to make the first permissioned external weak artifact safer to receive and review before any public claim is made.
The local fixture record shows the expected shape, but it is not a real submitter artifact.
