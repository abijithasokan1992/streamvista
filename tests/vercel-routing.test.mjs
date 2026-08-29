import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Vercel sends application routes to the clean SPA entrypoint", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

  assert.equal(config.outputDirectory, "dist");
  assert.equal(config.cleanUrls, true);
  assert.deepEqual(config.rewrites, [{ source: "/(.*)", destination: "/" }]);
});
