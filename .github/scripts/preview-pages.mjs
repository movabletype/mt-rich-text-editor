import { createHash } from "node:crypto";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const metadataFile = ".preview.json";

export function branchSlug(branch) {
  if (!branch) {
    throw new Error("branch name must not be empty");
  }

  const readable =
    branch
      .replace(/[^A-Za-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
      .replace(/-+$/g, "") || "branch";
  const hash = createHash("sha256").update(branch).digest("hex").slice(0, 8);

  return `${readable}-${hash}`;
}

export async function recordPreview(
  previewsDir,
  branch,
  sha,
  commitUrl,
  updatedAt,
) {
  const slug = branchSlug(branch);
  const metadata = {
    branch,
    commitUrl,
    sha,
    slug,
    updatedAt: updatedAt || new Date().toISOString(),
  };

  await writeFile(
    path.join(previewsDir, slug, metadataFile),
    `${JSON.stringify(metadata, null, 2)}\n`,
  );

  return metadata;
}

export async function cleanupPreviews(previewsDir, activeBranchesFile) {
  const branches = (await readFile(activeBranchesFile, "utf8"))
    .split("\n")
    .filter(Boolean);
  const activeSlugs = new Set(branches.map(branchSlug));
  const entries = await readdir(previewsDir, { withFileTypes: true });
  const removed = [];

  for (const entry of entries) {
    if (entry.name === "index.html" || activeSlugs.has(entry.name)) {
      continue;
    }

    await rm(path.join(previewsDir, entry.name), {
      force: true,
      recursive: true,
    });
    removed.push(entry.name);
  }

  return removed;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

export async function renderIndex(previewsDir) {
  const entries = await readdir(previewsDir, { withFileTypes: true });
  const previews = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    try {
      const metadata = JSON.parse(
        await readFile(
          path.join(previewsDir, entry.name, metadataFile),
          "utf8",
        ),
      );
      previews.push(metadata);
    } catch {
      // Ignore directories that are not managed editor previews.
    }
  }

  previews.sort((a, b) => a.branch.localeCompare(b.branch, "en"));

  const rows = previews
    .map((preview) => {
      const shortSha = escapeHtml(preview.sha.slice(0, 8));
      const updatedAt = escapeHtml(preview.updatedAt);
      return `          <tr>
            <td><a href="./${encodeURIComponent(preview.slug)}/">${escapeHtml(preview.branch)}</a></td>
            <td><a href="${escapeHtml(preview.commitUrl)}">${shortSha}</a></td>
            <td><time datetime="${updatedAt}">${updatedAt}</time></td>
          </tr>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Editor previews</title>
    <style>
      body { color: #222; font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 72rem; padding: 0 1rem; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border-bottom: 1px solid #ddd; padding: .75rem; text-align: left; }
      th { background: #f6f8fa; }
      code { font-family: ui-monospace, monospace; }
    </style>
  </head>
  <body>
    <h1>Editor previews</h1>
    <p>Static previews of the latest push to each branch.</p>
    <table>
      <thead>
        <tr><th>Branch</th><th>Commit</th><th>Updated</th></tr>
      </thead>
      <tbody>
${rows || '        <tr><td colspan="3">No previews are available yet.</td></tr>'}
      </tbody>
    </table>
  </body>
</html>
`;

  await writeFile(path.join(previewsDir, "index.html"), html);
  return previews;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "slug":
      console.log(branchSlug(args[0]));
      break;
    case "record":
      await recordPreview(...args);
      break;
    case "cleanup": {
      const removed = await cleanupPreviews(...args);
      for (const slug of removed) {
        console.log(`Removed ${slug}`);
      }
      break;
    }
    case "render":
      await renderIndex(...args);
      break;
    default:
      throw new Error(`unknown command: ${command || "(empty)"}`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
