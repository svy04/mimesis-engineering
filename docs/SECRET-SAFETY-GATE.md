# Secret Safety Gate

Status: local heuristic guardrail.

`audit:secrets` scans the local repository for common credential patterns and risky credential filenames before public claims or publication steps.

## Command

```bash
npm run audit:secrets
```

This writes:

```text
.mimesis/security/secret-safety-report.md
```

## What It Checks

- common cloud and API token patterns
- private key blocks
- secret-like assignments such as API keys, passwords, and OAuth tokens
- risky credential filenames such as `.env`, `.pem`, `.p12`, `.pfx`, and private key files

## Boundary

This gate does not prove production-grade security, complete secret detection, absence of all private data, or legal compliance.

It does not upload files, publish files, commit, push, redact, rotate, revoke, or validate credentials.
It does not publish anything by itself.

It is a local heuristic guardrail before stronger publication or proof claims.
