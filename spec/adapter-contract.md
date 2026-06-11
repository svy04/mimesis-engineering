# Adapter Contract

Adapters let Mimesis run inside AI tools without changing the method.

An adapter is not allowed to weaken the boundary.

## Adapter Must Provide

- a way to ingest a weak artifact
- a way to select or create a reference set
- a prompt or command for structure mapping
- a prompt or command for transformation
- a boundary check step
- a case note output
- a run ledger or audit trail

## Adapter Must Not

- invent proof
- hide references
- copy protected surface
- imply external validation
- skip the boundary check
- claim completion without artifacts

## Minimum Adapter Flow

```text
Import weak artifact
Import references
Create Artifact Brief
Create Structure Map
Create Transformation Plan
Create Improved Artifact
Run Boundary Check
Write Case Note
Update Run Ledger
```

## Adapter Status Labels

Use these labels:

- `contract` — a documented integration shape
- `prototype` — partially implemented
- `usable` — works on a real local loop
- `verified` — has a public case note proving use

v0.1 adapters in this repo are contracts unless explicitly marked otherwise.
