#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const failures = [];
const forceGhFailure = process.env.MIMESIS_REMOTE_AUDIT_FORCE_GH_FAIL === "1";

const repositories = [
  {
    nameWithOwner: "svy04/mimesis-engineering",
    url: "https://github.com/svy04/mimesis-engineering",
  },
  {
    nameWithOwner: "svy04/mimesis-canvas",
    url: "https://github.com/svy04/mimesis-canvas",
  },
  {
    nameWithOwner: "svy04/mimesis-casebook",
    url: "https://github.com/svy04/mimesis-casebook",
  },
];

function normalizeRestRepository(payload) {
  return {
    nameWithOwner: payload.full_name,
    visibility: payload.private ? "PRIVATE" : "PUBLIC",
    url: payload.html_url,
    defaultBranchRef: {
      name: payload.default_branch,
    },
    isArchived: payload.archived,
    isFork: payload.fork,
  };
}

function viewRepositoryWithGh(nameWithOwner) {
  if (forceGhFailure) {
    return {
      actual: null,
      error: "forced gh failure for fallback audit",
    };
  }

  const result = spawnSync("gh", [
    "repo",
    "view",
    nameWithOwner,
    "--json",
    "nameWithOwner,visibility,url,defaultBranchRef,isArchived,isFork",
  ], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return {
      actual: null,
      error: result.stderr || result.stdout || result.error?.message,
    };
  }

  try {
    return {
      actual: JSON.parse(result.stdout),
      error: null,
    };
  } catch (error) {
    return {
      actual: null,
      error: `could not parse gh output: ${error.message}`,
    };
  }
}

async function viewRepositoryWithRest(nameWithOwner) {
  const response = await fetch(`https://api.github.com/repos/${nameWithOwner}`, {
    headers: {
      "User-Agent": "mimesis-remote-ecosystem-audit",
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    return {
      actual: null,
      error: `GitHub REST API returned ${response.status} ${response.statusText}`,
    };
  }

  return {
    actual: normalizeRestRepository(await response.json()),
    error: null,
  };
}

for (const expected of repositories) {
  const ghResult = viewRepositoryWithGh(expected.nameWithOwner);
  let actual = ghResult.actual;
  let source = "remote";

  if (!actual) {
    const restResult = await viewRepositoryWithRest(expected.nameWithOwner);
    actual = restResult.actual;
    source = "remote:fallback";

    if (!actual) {
      failures.push(
        `remote view failed for ${expected.nameWithOwner}: gh=${ghResult.error}; fallback=${restResult.error}`,
      );
      continue;
    }
  }

  if (!actual) {
    continue;
  }

  console.log(`[${source}] ${actual.nameWithOwner} visibility=${actual.visibility} default=${actual.defaultBranchRef?.name}`);

  if (actual.nameWithOwner !== expected.nameWithOwner) {
    failures.push(`${expected.nameWithOwner}: unexpected repo name ${actual.nameWithOwner}`);
  }

  if (actual.url !== expected.url) {
    failures.push(`${expected.nameWithOwner}: unexpected url ${actual.url}`);
  }

  if (actual.visibility !== "PUBLIC") {
    failures.push(`${expected.nameWithOwner}: expected PUBLIC visibility, got ${actual.visibility}`);
  }

  if (actual.defaultBranchRef?.name !== "main") {
    failures.push(`${expected.nameWithOwner}: expected default branch main, got ${actual.defaultBranchRef?.name}`);
  }

  if (actual.isArchived) {
    failures.push(`${expected.nameWithOwner}: repository is archived`);
  }

  if (actual.isFork) {
    failures.push(`${expected.nameWithOwner}: repository is a fork`);
  }
}

if (failures.length) {
  console.error("\nMimesis remote ecosystem audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("\nMimesis remote ecosystem audit passed: expected public repositories are visible.");
