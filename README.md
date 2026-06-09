# Mimesis Engineering

Do not ask AI to pretend to be an expert.

Show it what experts actually made.

**Mimesis Engineering** is artifact-level imitation for AI-native work. It uses real products, papers, books, blogs, layouts, visual systems, user flows, proof surfaces, and decision loops as standards for AI-assisted creation.

한국어로 말하면:

> AI에게 전문가인 척하라고 시키는 게 아니라, 전문가들이 실제로 만든 결과물의 구조를 기준으로 내 작업을 바꾸는 방법입니다.

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

## Use It Now

1. New Korean users: read [처음 시작하기](docs/START-HERE.ko.md).
2. Builders: read the [5-minute quickstart](docs/QUICKSTART.md).
3. Read the [Working Spec](docs/WORKING-SPEC.md).
4. Fill a canvas from [mimesis-canvas](https://github.com/svy04/mimesis-canvas).
5. Compare your work with cases in [mimesis-casebook](https://github.com/svy04/mimesis-casebook).
6. Open a workflow case or risk check issue when the method needs improvement.

## Repository Map

### Core Method

- [MANIFESTO.md](MANIFESTO.md) — the public thesis.
- [FRAMEWORK.md](FRAMEWORK.md) — the MIMESIS loop.
- [GLOSSARY.md](GLOSSARY.md) — key terms.
- [PROOF-BOUNDARY.md](PROOF-BOUNDARY.md) — what this repo does and does not claim.
- [docs/START-HERE.ko.md](docs/START-HERE.ko.md) — Korean beginner entry page.
- [docs/QUICKSTART.md](docs/QUICKSTART.md) — 5-minute first use.
- [docs/WORKING-SPEC.md](docs/WORKING-SPEC.md) — current operating spec.

### Build and Launch System

- [docs/INITIAL-IMPLEMENTATION-STRATEGY.md](docs/INITIAL-IMPLEMENTATION-STRATEGY.md) — how this repo becomes a usable public system.
- [docs/LAUNCH-STRATEGY.md](docs/LAUNCH-STRATEGY.md) — the Mimesis Drop plan.
- [docs/TRAFFIC-ABSORPTION-SYSTEM.md](docs/TRAFFIC-ABSORPTION-SYSTEM.md) — how attention becomes cases, issues, contributors, and relationships.

### Templates

- [templates/codex-master-task.md](templates/codex-master-task.md) — Codex implementation prompt.
- [templates/hermes-launch-operator.md](templates/hermes-launch-operator.md) — Hermes daily operator prompt.
- [prompts/](prompts/) — prompt templates.

### Proof Surfaces

- [examples/](examples/) — applied templates.
- [cases/](cases/) — public case notes.
- [mimesis-casebook](https://github.com/svy04/mimesis-casebook) — public casebook.

## MIMESIS Loop

| Letter | Step | Question |
|---|---|---|
| M | Map the field | What products, papers, repos, and failures already define the space? |
| I | Identify predecessors | Which artifacts are worth learning from? |
| M | Model their structure | What knowledge, visual, user-flow, and proof structures make them work? |
| E | Extract patterns | What can be transferred, transformed, or rejected? |
| S | Synthesize variation | What should your version become under your constraints? |
| I | Inspect risk | Where can imitation become shallow, unclear, or weak? |
| S | Ship and revise | What evidence decides the next move? |

## Operator Layer

Mimesis Engineering is also being built as a work operating system.

| Actor | Role |
|---|---|
| Human operator | Direction, taste, final judgment |
| GPT | Strategy, writing, synthesis |
| Gemini | Skeptic, comparison, critique |
| Codex | Repository and implementation builder |
| Hermes | Daily operator, memory log, backlog, launch control |

Memory categories:

- **Sensation** — what people reacted to
- **Knowledge** — what became reliable
- **Wisdom** — what should guide the next move

## Launch Principle

The launch goal is compressed discovery:

> many real people finding one real artifact in one visible window.

Attention should come from real use, honest feedback, and clear proof boundaries.

## Start

1. Read [docs/START-HERE.ko.md](docs/START-HERE.ko.md) or [docs/QUICKSTART.md](docs/QUICKSTART.md).
2. Use [prompts/02-master-artifact-analysis.md](prompts/02-master-artifact-analysis.md).
3. Fill a canvas from [mimesis-canvas](https://github.com/svy04/mimesis-canvas).
4. Publish a case note using [mimesis-casebook](https://github.com/svy04/mimesis-casebook).

## Related

- Concept hub: https://svy04.github.io/mimesis-engineering/
- Prompt pack: https://svy04.github.io/posts/024-mimesis-prompts/
- Artifact-level Mimesis: https://svy04.github.io/posts/artifact-level-mimesis/
- Proof boundary: https://svy04.github.io/proof/
