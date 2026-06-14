# First Loop: 5-Minute Quickstart

Bring one weak artifact.
Leave with a stronger one.

## Requirements

- one artifact to improve
- one reference pack
- one LLM
- one place to write notes

## Run The First-Loop Demo

If you want to see the local artifact trail before using your own artifact:

```bash
npm run first-loop:demo
npm run audit:first-loop
```

This writes `.mimesis/first-loop-demo/`, then checks it with `workspace:check` and `case:check`.
It does not prove external adoption, benchmarked productivity, customer outcomes, legal originality, or a real external case.

Optional:

```bash
node tools/init-mimesis.mjs path/to/project
```

To start from a real weak artifact:

```bash
npm run cli -- case:start --artifact path/to/weak.md --reference-pack reference-packs/github-readme.md --title "Weak README"
```

This creates a started case workspace.
It is not a completed proof artifact yet.

## 1. Choose Your Weak Artifact

What to do:
Pick one thing that exists now.

Example:
A README that explains the repo but does not make anyone want to try it.

Output artifact:
Artifact Brief.

## 2. Pick a Reference Pack

What to do:
Choose the pack closest to the artifact.

Example:
Use the [GitHub README Reference Pack](../reference-packs/github-readme.md).

Output artifact:
Reference Set.

## 3. Decompose Strong Artifacts

What to do:
Study the references before generating.

Example:
Inspect opening hook, quickstart, trust devices, limitations, and contribution path.

Output artifact:
Structure Map.

## 4. Extract Transferable Structure

What to do:
Separate structure from surface.

Example:
Use "old way vs new way" as a contrast pattern.
Do not copy exact wording.

Output artifact:
Transferable Patterns.

## 5. Transform Your Artifact

What to do:
Rewrite under your own constraints.

Example:
Change the README so the first action appears before the repo map.

Output artifact:
Improved Artifact.

## 6. Inspect the Boundary

What to do:
Check for surface copying, overclaiming, and weak proof.

Example:
Remove claims that imply external adoption if no public case proves it.

Output artifact:
Boundary Check.

## 7. Write a Case Note

What to do:
Record before, references, extracted structure, after, improvement, and unproven claims.

Example:
Write `cases/001-mimesis-on-mimesis.md`.

Output artifact:
Case Note.

Your First Loop is done when you can say:

```text
I started with ____.
I studied ____.
I extracted ____.
I changed ____.
The result is stronger because ____.
The proof boundary is ____.
```

## Optional Local Check

If you are using this repository shape, run:

```bash
node tools/validate-mimesis.mjs
```

This checks the local protocol surface.
It does not prove external adoption or outcome improvement.

To check a filled case workspace:

```bash
npm run cli -- case:check path/to/case
```

This rejects started cases and missing before/after evidence.
