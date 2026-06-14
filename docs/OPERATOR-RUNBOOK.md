# Operator Runbook

Status: local ecosystem runbook.

`operator:runbook` generates a current runbook for using `mimesis-engineering`, `mimesis-canvas`, and `mimesis-casebook` together.

## Command

```bash
npm run operator:runbook
```

or:

```bash
npm run cli -- operator:runbook
```

This writes:

```text
.mimesis/operator-runbooks/current-runbook.md
```

## Purpose

Use this when an operator needs the shortest safe path from idea to local evidence:

1. Start in `mimesis-engineering` for the method, protocol, tools, and validators.
2. Use `mimesis-canvas` when the artifact is still too fuzzy for the full file protocol.
3. Use `mimesis-casebook` to see how before/after and proof boundaries are written.
4. Return to `mimesis-engineering` to generate packets, run checks, and keep claims bounded.

## Boundary

This runbook does not prove external adoption, choose a license, create external proof, publish to npm, publish a GitHub Marketplace action, tag a release, or push commits.
It does not publish anything by itself.

It is an operator path through local resources, not proof that the resources have been externally adopted or published.

## Audit

Run:

```bash
npm run audit:operator-runbook
```

The audit checks that the generated runbook names each repository role, command loop, stop condition, and proof boundary.
