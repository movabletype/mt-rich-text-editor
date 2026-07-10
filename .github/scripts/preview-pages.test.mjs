import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  branchSlug,
  cleanupPreviews,
  recordPreview,
  renderIndex,
} from "./preview-pages.mjs";

async function temporaryDirectory(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "preview-pages-"));
  t.after(() => rm(directory, { force: true, recursive: true }));
  return directory;
}

test("branchSlug is readable, stable, and collision resistant", () => {
  assert.match(
    branchSlug("feat/table-editor"),
    /^feat-table-editor-[0-9a-f]{8}$/,
  );
  assert.equal(
    branchSlug("feat/table-editor"),
    branchSlug("feat/table-editor"),
  );
  assert.notEqual(
    branchSlug("feat/table/editor"),
    branchSlug("feat-table-editor"),
  );
});

test("cleanupPreviews removes previews for deleted branches", async (t) => {
  const directory = await temporaryDirectory(t);
  const active = branchSlug("develop");
  const deleted = branchSlug("feat/deleted");
  const branchesFile = path.join(directory, "branches.txt");
  const previewsDir = path.join(directory, "previews");

  await mkdir(path.join(previewsDir, active), { recursive: true });
  await mkdir(path.join(previewsDir, deleted), { recursive: true });
  await writeFile(path.join(previewsDir, "index.html"), "index");
  await writeFile(branchesFile, "develop\n");

  assert.deepEqual(await cleanupPreviews(previewsDir, branchesFile), [deleted]);
  assert.equal(
    await readFile(path.join(previewsDir, "index.html"), "utf8"),
    "index",
  );
  assert.equal(
    (await stat(path.join(previewsDir, active))).isDirectory(),
    true,
  );
});

test("renderIndex escapes branch and commit metadata", async (t) => {
  const directory = await temporaryDirectory(t);
  const previewsDir = path.join(directory, "previews");
  const branch = "feature/<script>&test";
  const slug = branchSlug(branch);

  await mkdir(path.join(previewsDir, slug), { recursive: true });
  await recordPreview(
    previewsDir,
    branch,
    "1234567890abcdef",
    "https://example.com/commit?a=1&b=2",
    "2026-07-10T00:00:00.000Z",
  );
  await renderIndex(previewsDir);

  const html = await readFile(path.join(previewsDir, "index.html"), "utf8");
  assert.match(html, /feature\/&lt;script&gt;&amp;test/);
  assert.match(html, /https:\/\/example\.com\/commit\?a=1&amp;b=2/);
  assert.doesNotMatch(html, /<script>/);
});
