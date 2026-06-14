# Goal Completion Audit

Status: local goal completion audit, not proof of completion.

`goal:completion-audit` generates objective evidence for the active goal:

```text
전 레포 자원과 잘사용해서 프레임워크 완성할때까지 달리자
```

It writes:

```text
.mimesis/completion/goal-completion-audit.json
```

Run it with:

```bash
npm run goal:completion-audit
```

or:

```bash
npm run cli -- goal:completion-audit
```

Audit it with:

```bash
npm run audit:goal-completion-audit
```

## What It Checks

- objective evidence from README, specs, adapters, plugins, reference packs, cases, prompts, and `.mimesis`
- `completionAllowed: false` while open gates remain
- local framework requirements that are proven by repository files
- open gates that still require owner, external, publication, benchmark, or adoption evidence
- required fresh commands before any future completion claim

## Boundary

This goal completion audit does not prove completion.
It makes no completion claim.
It does not mark the active goal complete, close gates, publish, push, tag, release, choose a license, create external proof, prove adoption, or prove benchmarked productivity.

Use it as a stop-check before claiming the framework is complete.
