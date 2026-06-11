# Mimesis Ecosystem

Mimesis Engineering is the framework hub.
The neighboring repositories provide focused surfaces.

## Repositories

| Repository | Role | What It Adds |
| --- | --- | --- |
| `svy04/mimesis-engineering` | Framework hub | method, protocol, templates, reference packs, adapters, proof boundary, validator |
| `svy04/mimesis-canvas` | Worksheet | 10-part canvas, Notion-ready structure, domain examples |
| `svy04/mimesis-casebook` | Case library | public cases with starting artifact, Mimesis lens, change, boundary, and next proof |

## How They Work Together

1. Start in `mimesis-engineering` to understand the method and initialize `.mimesis`.
2. Use `mimesis-canvas` when you need a lighter worksheet before the full protocol.
3. Use `mimesis-casebook` when you need examples of before/after and proof boundary writing.
4. Return to `mimesis-engineering` to validate the artifact trail.

## Canvas Bridge

The canvas asks:

- desired artifact
- ten strong artifacts
- knowledge structure
- visual structure
- language rhythm
- user flow
- taste
- do not copy
- transform
- seven-day version

In this repo, those map to:

- Artifact Brief
- Reference Set
- Structure Map
- Transformation Plan
- Improved Artifact
- Boundary Check
- Case Note
- Run Ledger

## Casebook Bridge

Casebook cases usually show:

- starting artifact
- Mimesis lens or reference structure
- what changed
- what remains unproven
- next proof artifact

In this repo, those map to:

- `cases/`
- `.mimesis/case-note.md`
- `.mimesis/boundary-check.md`
- `.mimesis/run_ledger.md`

## Resource Packet

Generate the local resource index before choosing canvas or casebook material:

```bash
npm run ecosystem:resources
```

This writes `.mimesis/ecosystem-resources/current-resource-packet.md`.
It indexes paths and recommended uses.
It does not copy neighboring repository content, prove external adoption, or prove remote freshness.

## Boundary

This ecosystem map confirms repository roles and local resource flow.
It does not claim external adoption, commercial validation, or universal effectiveness.

## Local Audit

If the neighboring repositories are checked out next to this repo, run:

```bash
npm run audit:ecosystem
```

This verifies the local workspace contains the expected canvas and casebook resources.
