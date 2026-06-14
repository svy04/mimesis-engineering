# Local Filesystem Adapter Contract

Status: `usable`

Use when a builder wants to run Mimesis with plain Markdown files and no external tool.

## How It Works

1. Copy `.mimesis/` into your project.
2. Choose one template from `templates/`.
3. Choose one reference pack from `reference-packs/`.
4. Fill the files in order.
5. Improve the artifact.
6. Write a case note.

## Why This Adapter Is Usable

The files already exist in this repository.
They can be copied and filled manually.
No external service is required.

## Evidence

Local evidence in this repository:

- `.mimesis/` contains the current protocol workspace.
- `templates/` contains fillable protocol templates.
- `tools/init-mimesis.mjs` creates `.mimesis` workspaces from templates.
- `tools/validate-mimesis.mjs` validates the local framework protocol.
- `npm run validate` passes for the current framework surface.

## Boundary

This is a local file workflow.
It does not prove external adoption, benchmarked productivity, or legal originality.
