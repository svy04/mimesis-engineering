# Publication Evidence Packet

Status: local publication evidence packet, not publication proof.

`publication:evidence-packet` generates a direct publication evidence intake packet for npm, GitHub Action, Marketplace, and plugin release claims.

## Command

```bash
npm run publication:evidence-packet
```

or:

```bash
npm run cli -- publication:evidence-packet
```

This writes:

```text
.mimesis/release-evidence/publication-evidence-packet.md
```

Audit it with:

```bash
npm run audit:publication-evidence-packet
```

## What It Requires

- direct publication evidence
- npm publication evidence when an npm claim is made
- GitHub Marketplace action evidence or tag evidence when an action claim is made
- plugin release or installation evidence when a shipped-plugin claim is made
- reviewed evidence packet before public copy changes
- account, repository, package, tag, listing, or host boundary

## Boundary

This publication evidence packet does not publish.
It does not stage, commit, push, tag, release, publish to npm, publish a GitHub Marketplace action, ship a plugin, choose a license, create external proof, prove adoption, or close gates.

Use `templates/evidence-packet.md` and `evidence:check --require-reviewed` before making a publication, action, package, or shipped-plugin claim.
