import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { auditRepository, inspectTrackedFile } from '../../scripts/release-security-check.mjs';

test('release policy rejects nested secrets but permits environment examples', () => {
  for (const path of ['apps/api/.env.production', '.env.local', 'apps/api/google-service-account.json', 'keys/private.key']) {
    assert.ok(inspectTrackedFile(path, '').length, path);
  }
  assert.deepEqual(inspectTrackedFile('apps/api/.env.example', ''), []);
  assert.ok(inspectTrackedFile('apps/api/src/auth.ts', 'password === "admin"').length);
});

test('audit scans tracked runtime files, handles spaces, and fails on missing files', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'sv-release-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet'], { cwd });
  mkdirSync(join(cwd, 'apps/api'), { recursive: true });
  writeFileSync(join(cwd, 'apps/api/unsafe code.ts'), 'const password = "x"; if (password === "admin") allow();');
  execFileSync('git', ['add', '.'], { cwd });
  const result = auditRepository(cwd);
  assert.equal(result.trackedCount, 1);
  assert.deepEqual(result.findings, [{ file: 'apps/api/unsafe code.ts', reasons: ['default admin password bypass'] }]);
  rmSync(join(cwd, 'apps/api/unsafe code.ts'));
  assert.throws(() => auditRepository(cwd), /ENOENT/);
});
