# Reference Pack Index

Status: generated local source-first standards index.

The reference pack index makes the `reference-packs/` folder easier for AI-native tooling to read.
It turns the Markdown packs into a machine-readable catalog of use cases, source-quality notes, inspection fields, transferable patterns, what not to copy, and starter prompts.

## Why It Exists

Mimesis starts with:

```text
Give AI standards, not roles.
Bring one weak artifact.
```

The reference pack index keeps those standards visible before an agent transforms an artifact.
It helps an operator or tool choose a pack without treating the pack as a swipe file.

## Generate

```bash
npm run reference:index
```

or:

```bash
npm run cli -- reference:index
```

This writes:

```text
.mimesis/reference-packs/index.json
```

## Audit

```bash
npm run audit:reference-index
```

or:

```bash
npm run cli -- audit:reference-index
```

The audit checks:

- generated index presence and stale-output detection
- package scripts
- CLI commands
- release-check wiring
- all seven starter reference packs
- source-first source-quality fields
- inspect fields
- transferable pattern fields
- what not to copy fields
- starter prompts
- local proof boundaries

## Boundary

The reference pack index is local framework evidence.

It does not prove external adoption.
It does not prove package publication.
It does not prove source quality by itself.
It does not create external proof.
It does not permit copying protected surface, customer proof, brand voice, layout, screenshots, or unsupported claims.
