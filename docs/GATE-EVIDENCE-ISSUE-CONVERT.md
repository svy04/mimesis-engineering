# Gate Evidence Issue Convert

Status: issue-to-evidence-packet conversion, not proof.

`gate:evidence-issue-convert` converts a GitHub Gate Evidence issue body into a local draft evidence packet candidate.
It exists so issue intake can move toward `evidence:check` and `evidence:review` without pretending the issue is already proof.

## Commands

Convert the fixture issue body:

```bash
npm run gate:evidence-issue-convert
```

Convert a local Gate Evidence issue body:

```bash
npm run cli -- gate:evidence-issue-convert path/to/gate-evidence-issue.md --output path/to/evidence-packet.md --report path/to/report.md --require-complete
```

Audit the converter:

```bash
npm run audit:gate-evidence-issue-convert
```

## Fixture Files

- `.mimesis/gates/fixture-gate-evidence-issue.md`
- `.mimesis/gates/fixture-gate-evidence-packet.md`
- `.mimesis/gates/fixture-gate-evidence-issue-conversion-report.md`

## Intended Flow

```text
GitHub Gate Evidence issue
-> gate:evidence-issue-convert
-> evidence:check
-> evidence:review
-> gate:closure-readiness
-> gate:closure-review
```

The converter writes a draft evidence packet.
The draft packet can pass structure checks, but it is not reviewed evidence.

## Boundary

This converter does not close gates.
It does not create proof.
It does not review evidence.
It does not publish.
It does not prove adoption.
It does not prove benchmarked productivity.
It does not choose a license.
It does not prove package publication, Marketplace publication, shipped plugin status, customer outcomes, commercial outcomes, or legal originality.
