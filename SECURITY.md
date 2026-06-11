# Security

Mimesis Engineering v0.1 is primarily a Markdown framework and local validator.

## Supported Surface

Security-relevant surfaces:

- `tools/validate-mimesis.mjs`
- `tools/audit-secret-safety.mjs`
- GitHub issue templates
- documentation that instructs users to handle artifacts, references, or secrets

## Report A Problem

If GitHub private vulnerability reporting is enabled for this repository, use it.

If not, open an issue only when the report does not contain secrets, tokens, private user data, or exploit details that should not be public.

## Do Not Submit

Do not paste:

- API keys
- OAuth tokens
- passwords
- private documents
- customer data
- confidential source material

## Boundary

This repository does not claim production-grade security coverage.
The current security posture is documentation-level guardrails plus local validation and a heuristic secret safety audit.
It does not prove production-grade security coverage.
