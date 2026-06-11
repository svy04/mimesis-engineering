#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "release-execution", "v0.1-owner-handoff.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const packageJson = JSON.parse(read("package.json"));
const privatePackage = packageJson.private === true;
const unlicensed = packageJson.license === "UNLICENSED";

const generated = `# Mimesis Release Execution Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: owner release execution handoff, not release execution.

## Runtime Execution Gates

- public preflight: run \`npm run release:check:public\`
- sync proof: run \`npm run audit:sync:strict\`
- secret scan: run \`npm run audit:secrets\`
- license boundary: run \`npm run audit:license\`
- package boundary: run \`npm run audit:package\`
- action boundary: run \`npm run audit:action\`
- package private: ${privatePackage ? "yes" : "no"}
- package license: \`${packageJson.license ?? "none"}\`
- committed release execution packet is not a sync proof
- this packet intentionally avoids branch, commit hash, upstream head, dirty-worktree counts, changed-entry lists, and embedded sync reports

Conclusion:
${!privatePackage && !unlicensed
  ? "The package metadata is closer to publication, but runtime sync, owner decision, and proof gates still apply."
  : "This local checkout is not publish-ready because at least one owner, sync, package, or license gate remains open."}

## Required Preflight

Run these before any owner-controlled release action:

\`\`\`bash
npm run release:check:public
npm run audit:sync:strict
npm run audit:secrets
npm run audit:license
npm run audit:package
npm run audit:action
\`\`\`

## Owner Decisions

1. Decide whether this local work belongs in the public v0.1 framework release.
2. Choose a license or preserve the current no-reuse boundary.
3. Decide whether \`package.json private\` should remain true.
4. Decide whether npm publication is in scope.
5. Decide whether a tagged GitHub Action release or Marketplace listing is in scope.
6. Decide whether external proof, benchmark, or adoption claims are excluded from this release copy.

## Release Sequence

This is the safe order for an owner-controlled release:

1. Review \`docs/LICENSE-PACKET.md\` and choose or defer the license.
2. Run \`npm run release:check:public\`.
3. Generate and review \`.mimesis/release-decisions/owner-decision-record.json\`.
4. Resolve all intentional local changes into a reviewed commit or PR.
5. Run \`npm run audit:sync:strict\` only after the worktree should be clean and synced.
6. Review \`docs/PUBLISH-HANDOFF-PACKET.md\`.
7. Review \`docs/PACKAGE-RELEASE-CANDIDATE.md\` before any npm action.
8. Review \`docs/ACTION-RELEASE-CANDIDATE.md\` before any tag or Marketplace claim.
9. Publish only from owner-controlled accounts and only after evidence packets support any stronger claims.

## Publication Gates

| Gate | Current Signal | Required Before Claim |
| --- | --- | --- |
| public preflight | \`npm run release:check:public\` is available | fresh passing run |
| strict sync | runtime-only check required | \`npm run audit:sync:strict\` passes |
| license | \`${packageJson.license ?? "none"}\` | owner-selected license or explicit no-reuse boundary |
| npm package | private: ${privatePackage ? "true" : "false"} | owner changes package metadata and publishes from owner account |
| GitHub Action | root \`action.yml\` candidate exists | tag/release or Marketplace evidence |
| external proof | no completed permissioned external proof in current completion matrix | reviewed evidence packet |

## Allowed Claim

The repository has a generated owner release execution handoff and public preflight path.

## Disallowed Claim

This packet does not prove that the repository has been committed, pushed, tagged, released, published to npm, published as a GitHub Marketplace action, licensed for reuse, externally adopted, benchmarked, or synchronized to the public remote.

## Boundary

This packet does not publish, does not stage files, does not create a commit, does not push, does not create a tag, does not create a release, does not publish to npm, does not publish a GitHub Marketplace action, does not choose a license, and does not create external proof.

Reference documents:

- \`docs/LICENSE-PACKET.md\`
- \`docs/RELEASE-DECISION-RECORD.md\`
- \`docs/PUBLISH-HANDOFF-PACKET.md\`
- \`docs/PUBLISH-SYNC-GATE.md\`
- \`docs/PACKAGE-RELEASE-CANDIDATE.md\`
- \`docs/ACTION-RELEASE-CANDIDATE.md\`
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[release-execution-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);
