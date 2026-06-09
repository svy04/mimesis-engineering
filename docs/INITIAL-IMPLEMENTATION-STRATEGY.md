# Initial Implementation Strategy

This document turns the current intent into buildable work.

The immediate mission is not “write more philosophy.”

The mission is to make Mimesis Engineering look and behave like a real open-source operating method that a builder can understand, try, trust, and share.

## 1. Product Shape

Mimesis Engineering should be packaged as four layers.

| Layer | Purpose | Public Asset |
|---|---|---|
| Thesis | Make people understand why this exists | README, MANIFESTO, FRAMEWORK |
| Tool | Let people apply it immediately | Canvas, prompts, templates |
| Proof | Show that it changes real work | Casebook, before/after notes |
| Operating System | Let the maintainer keep improving it | Hermes loop, Codex backlog, Memory Log |

## 2. Current Best Positioning

Bad positioning:

> A prompt framework for experts.

Better positioning:

> Artifact-level imitation for AI-native work.

Strongest launch positioning:

> AI models got better. Workflows did not. Mimesis Engineering turns strong artifacts into standards for AI-assisted creation.

## 3. What GitHub Visitors Must Feel

The first visitor reaction should not be “interesting theory.”

It should be:

1. “This is different from persona prompts.”
2. “I can use this on my own project.”
3. “There are examples, not just claims.”
4. “I should star this and come back.”
5. “This person is building a real AI-native work system.”

## 4. v0.1 Build Requirements

Before major launch, the repo should have:

- README with 30-second explanation
- 5-minute quickstart
- clear MIMESIS loop
- public proof boundary
- Korean and English entry points
- at least 2 strong cases
- canvas link
- prompt link
- issue templates
- launch strategy doc
- traffic absorption doc
- maintainer operating loop

## 5. Repository System Design

### `mimesis-engineering`

This is the canonical public hub.

It should hold:

- core thesis
- framework
- launch story
- links to all related assets
- contribution path
- public proof boundary

### `mimesis-canvas`

This is the application surface.

It should answer:

> “How do I use this on my work right now?”

Required improvement:

- Add a direct quickstart from `mimesis-engineering`.
- Make one small filled example extremely easy to understand.

### `mimesis-casebook`

This is the proof surface.

It should answer:

> “What changed after applying Mimesis?”

Required improvement:

- Each case must show before, reference artifacts, extracted structures, transformation, and what remains unproven.

### `harness-meta`

This is the operator layer.

It should not be the main public entry for Mimesis. It should support the maintainer by storing:

- decisions
- pain points
- daily digest
- handoff notes
- drift checks
- memory logs

### `chetdeuk-engine`

This is the future learning and repetition layer.

It can later become:

- daily Mimesis practice bot
- framework extraction tutor
- weekly publish habit engine

For launch v0.1, it should only be referenced as future direction, not as a dependency.

### `market-intelligence`

This should remain private unless cleaned.

Use it for:

- channel map
- competitor/reference map
- creator list
- launch timing signals
- copy testing notes

## 6. Implementation Phases

### Phase 1 — Make the Repo Understandable

Goal: 30-second understanding.

Tasks:

- rewrite README opening
- add public quickstart
- add repo map
- add “not persona prompts” contrast
- add proof boundary link near the top

### Phase 2 — Make the Method Usable

Goal: 5-minute first use.

Tasks:

- link canvas clearly
- add a one-page starter template
- add a tiny example
- add prompt entry points for product, paper, blog, README, landing page

### Phase 3 — Make the Method Believable

Goal: proof before hype.

Tasks:

- pick two flagship cases
- make before/after obvious
- show claim boundaries
- show what changed because of Mimesis

### Phase 4 — Prepare the Drop

Goal: one coordinated public discovery window.

Tasks:

- prepare X thread
- prepare LinkedIn post
- prepare Hacker News Show HN copy
- prepare Product Hunt copy only if the package feels usable as a product/toolkit
- prepare Disquiet, OKKY, Velog posts
- prepare GitHub release notes

### Phase 5 — Absorb Traffic

Goal: turn traffic into relationships and proof.

Tasks:

- open Discussions or issue templates
- add “share your workflow” CTA
- create contributor path
- track DMs, issues, forks, stars, comments, and cases
- log every useful reaction into Sensation / Knowledge / Wisdom

## 7. Codex Backlog

Use these as implementation tickets.

- C001: Rewrite README opening and quickstart.
- C002: Add `docs/WORKING-SPEC.md`.
- C003: Add `docs/INITIAL-IMPLEMENTATION-STRATEGY.md`.
- C004: Add `docs/LAUNCH-STRATEGY.md`.
- C005: Add `docs/TRAFFIC-ABSORPTION-SYSTEM.md`.
- C006: Add Codex master task template.
- C007: Add Hermes launch operator template.
- C008: Add GitHub issue templates.
- C009: Add two flagship case links to README.
- C010: Add a Korean beginner entry page.
- C011: Add a one-page 5-minute quickstart.
- C012: Add launch release checklist.

## 8. Definition of Done

The repo is launchable when a stranger can do this without explanation from the maintainer:

1. Understand the idea.
2. Open a canvas.
3. Apply it to one artifact.
4. See at least one case.
5. Know what to do next.
6. Trust the proof boundary.
7. Star, fork, discuss, or contribute.
