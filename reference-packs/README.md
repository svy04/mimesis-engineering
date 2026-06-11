# Reference Packs

Reference packs define what to study before transforming an artifact.

They are not swipe files.
They are standard fields.
They should point users toward primary/original sources whenever possible.

Source-first rules:

- start from local repo/runtime truth when the artifact is local
- prefer official docs, maintained source repos, papers, patents, standards, and public artifacts
- use secondary commentary only as a route to primary/original sources
- record source type and claim boundary in `.mimesis/reference-set.md`

## Packs

- [GitHub README](github-readme.md)
- [Landing Page](landing-page.md)
- [Product Page](product-page.md)
- [Blog Post](blog-post.md)
- [AI Workflow](ai-workflow.md)
- [Research Note](research-note.md)
- [Profile Positioning](profile-positioning.md)

## How To Use

1. Pick the pack closest to your weak artifact.
2. Add concrete references in `.mimesis/reference-set.md`.
3. Extract structure into `.mimesis/structure-map.md`.
4. Transform your artifact without copying protected surface.

Read the [Source-First Protocol](../docs/SOURCE-FIRST-PROTOCOL.md) before publishing a case.

## Machine-Readable Index

Generate the local reference pack index:

```bash
npm run reference:index
npm run audit:reference-index
```

This writes `.mimesis/reference-packs/index.json`.
It helps AI-native tooling choose standards before transforming one weak artifact.
It does not prove external adoption, package publication, source quality by itself, or permission to copy protected surface.

Read the [Reference Pack Index](../docs/REFERENCE-PACK-INDEX.md).
