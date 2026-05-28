# Mimesis Engineering

Do not ask AI to pretend to be an expert.

Show it what experts actually made.

**Mimesis Engineering** is artifact-level imitation for AI-native work. It uses real products, papers, books, blogs, layouts, visual systems, user flows, and decision loops as standards for AI-assisted creation.

## Core Idea

Persona prompts imitate roles.

Mimesis imitates artifact structure.

Instead of saying:

```text
You are a world-class expert.
```

Start from:

```text
Here are the best artifacts in this field.
Decompose their knowledge structure, visual structure, user flow, trust devices, failure handling, and claim boundaries.
Then use those standards to critique and transform my current work.
```

## Repository Map

- [MANIFESTO.md](MANIFESTO.md) — the public thesis.
- [FRAMEWORK.md](FRAMEWORK.md) — the MIMESIS loop.
- [GLOSSARY.md](GLOSSARY.md) — key terms.
- [PROOF-BOUNDARY.md](PROOF-BOUNDARY.md) — what this repo does and does not claim.
- [prompts/](prompts/) — prompt templates.
- [examples/](examples/) — applied templates.
- [cases/](cases/) — public case notes.

## MIMESIS Loop

| Letter | Step | Question |
|---|---|---|
| M | Map the field | What products, papers, repos, and failures already define the space? |
| I | Identify predecessors | Which artifacts are worth learning from? |
| M | Model their structure | What knowledge, visual, user-flow, and proof structures make them work? |
| E | Extract patterns | What can be transferred, transformed, or rejected? |
| S | Synthesize variation | What should your version become under your constraints? |
| I | Inspect failure modes | Where can imitation become copying, fantasy, or weak proof? |
| S | Ship and revise | What evidence decides the next move? |

## Start

1. Read [MANIFESTO.md](MANIFESTO.md).
2. Use [prompts/02-master-artifact-analysis.md](prompts/02-master-artifact-analysis.md).
3. Fill a canvas from [mimesis-canvas](https://github.com/svy04/mimesis-canvas).
4. Publish a case note in the shape of [cases/quantflow-alpha-court.md](cases/quantflow-alpha-court.md).

## Related

- Concept hub: https://svy04.github.io/mimesis-engineering/
- Prompt pack: https://svy04.github.io/posts/024-mimesis-prompts/
- Artifact-level Mimesis: https://svy04.github.io/posts/artifact-level-mimesis/
- Proof boundary: https://svy04.github.io/proof/
