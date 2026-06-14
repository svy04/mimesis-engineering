# Source-First Protocol

Status: required reference discipline for v0.1 loops.

Mimesis starts from artifacts, not vibes.
This protocol makes the reference step inspectable.

## Prior Art Used

This is a lightweight local protocol, not a full metadata standard.

It borrows practical structure from:

- [W3C PROV-DM](https://www.w3.org/TR/prov-dm/) - provenance as entities, activities, and agents.
- [FAIR Principles](https://www.nature.com/articles/sdata201618) - sources should be findable, accessible, interoperable, and reusable enough to inspect.
- [FORCE11 Software Citation Principles](https://force11.org/info/software-citation-principles-published-2016/) - software and tool references should be named clearly enough for credit and reuse decisions.

## Mimesis Adaptation

For a Mimesis loop:

- entity = weak artifact, reference artifact, improved artifact, or case note
- activity = Import, Distill, Capsule, Shard, Verify, or Remember
- agent = human operator, AI tool, repository, organization, or source owner

Every reference set should make those relationships visible enough that another builder can inspect the transformation without guessing where structure came from.

## Required Reference Set Fields

Use these columns in `.mimesis/reference-set.md`:

| Field | Meaning |
| --- | --- |
| Source Type | official docs, source repo, paper, patent, standard, public page, casebook case, local artifact, user-provided spec |
| Source / Reference | stable name and link or file path |
| Why It Is Strong | why this belongs in the standard field |
| What To Inspect | structure, workflow, proof rhythm, boundary, interface, failure handling |
| What Not To Copy | wording, layout, brand, private data, protected material, authority, unsupported claims |
| Claim Boundary | what this source does not prove |

## Source Preference

Prefer:

1. local repo/runtime truth for current project facts
2. official docs or maintained source repos
3. standards, papers, patents, and formal specs
4. public case notes with visible before/after artifacts
5. secondary commentary only as a route to primary/original sources

## Minimum Loop Rule

A Mimesis loop is not source-first if:

- references are hidden
- the source type is vague
- the artifact owner or permission boundary is unclear
- a secondary summary replaces the original source
- a reference is used for authority rather than structure
- a claim is stronger than the source supports

## Boundary

This protocol does not prove legal originality, permission to reuse protected material, external adoption, or customer outcome proof.
It only proves that source provenance was recorded clearly enough for review.
