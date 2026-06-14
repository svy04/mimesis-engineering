# Reference Packs

A Reference Pack is not a moodboard.
It is a standard pack.

It gives AI and the builder a field of strong artifacts to study before generating anything.

## What a Reference Pack Is

A Reference Pack defines what good artifacts in a domain usually do.

It gives you:

- what to inspect
- what can transfer
- what must not be copied
- a starter prompt

## When to Use One

Use a Reference Pack before asking AI to improve an artifact.

Do not start from a blank prompt.
Start from standards.

## What Every Pack Contains

- Use When
- What Good Artifacts Usually Do
- What to Inspect
- Transferable Patterns
- Do Not Copy
- Starter Prompt

## How to Choose References

Choose references that are:

- clear
- trusted
- well-structured
- usable
- proof-aware
- relevant to your artifact

Avoid references where the only useful part is surface style.

## What Not to Copy

Do not copy:

- exact wording
- distinctive layout
- brand voice
- visuals
- unsupported claims
- social proof you do not have

## Existing Packs

- [GitHub README](../reference-packs/github-readme.md)
- [Landing Page](../reference-packs/landing-page.md)
- [Product Page](../reference-packs/product-page.md)
- [Blog Post](../reference-packs/blog-post.md)
- [AI Workflow](../reference-packs/ai-workflow.md)
- [Research Note](../reference-packs/research-note.md)
- [Profile Positioning](../reference-packs/profile-positioning.md)

## Machine-Readable Index

Run:

```bash
npm run reference:index
npm run audit:reference-index
```

This writes `.mimesis/reference-packs/index.json`.
It is a local source-first standards index for AI-native tooling.
It does not prove external adoption, package publication, source quality by itself, or permission to copy protected surface.

Read [Reference Pack Index](REFERENCE-PACK-INDEX.md).

## Standard Reference Pack Format

```text
Use When
What Good Artifacts Usually Do
What to Inspect
Transferable Patterns
Do Not Copy
Starter Prompt
```
