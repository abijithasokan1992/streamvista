// Reconciled from the existing release-blocker-remediation branch and PR #125.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import console from 'node:console';

const forbiddenPrefixes = ['.codeoss/', '.npm/', 'gopath/', '.config/', '.gsutil/', '.docker/', '.rustup/'];
const forbiddenFiles = new Set(['generate-token.js', 'generate-token-manual.js']);
const forbiddenPatterns = [
  ['fallback JWT signing secret', /streamvista_super_secret_key_2026|autoos_secret_key_2026/],
  ['default admin password bypass', /password\s*===\s*["']admin["']/],
  ['placeholder payment secret', /your_key_secret|streamvista_secret/],
  ['production mock state', /ZERO-COST MOCK MODE|MockDB|memoryUsers|memoryProjects|memoryFiles|memoryBridgeSubmissions|memoryDeliveryPackages/],
];

export function inspectTrackedFile(file, content) {
  const name = file.split('/').at(-1);
  if (forbiddenPrefixes.some((prefix) => file.startsWith(prefix))) return ['tracked generated/system state'];
  if (forbiddenFiles.has(file)
    || (name !== '.env.example' && /^\.env(?:\.|$)/.test(name))
    || /(?:service-account|credentials).*\.json$/i.test(name)
    || /\.(?:pem|key)$/i.test(name)) return ['tracked credential/configuration file'];
  if (!/^(?:apps|packages|src|api|supabase)\//.test(file) || !/\.(?:[cm]?[jt]sx?|sql)$/.test(file)) return [];
  if (/(?:^|\/)(?:node_modules|dist|tests|__tests__)\//.test(file) || /\.(?:test|spec)\.[^.]+$/.test(file)) return [];
  return forbiddenPatterns.filter(([, pattern]) => pattern.test(content)).map(([label]) => label);
}

export function auditRepository(cwd) {
  // NUL delimiters preserve spaces and unusual filenames. Missing files fail closed.
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).split('\0').filter(Boolean);
  const findings = [];
  for (const file of tracked) {
    const pathFindings = inspectTrackedFile(file, '');
    if (pathFindings.length) {
      findings.push({ file, reasons: pathFindings });
      continue;
    }
    if (!/^(?:apps|packages|src|api|supabase)\//.test(file) || !/\.(?:[cm]?[jt]sx?|sql)$/.test(file)) continue;
    const reasons = inspectTrackedFile(file, readFileSync(resolve(cwd, file), 'utf8'));
    if (reasons.length) findings.push({ file, reasons });
  }
  return { trackedCount: tracked.length, findings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { trackedCount, findings } = auditRepository(process.cwd());
    if (findings.length) {
      // Never print matching source lines or credential values.
      console.error(`Release security policy blocked: ${findings.length} tracked files.`);
      findings.sort((a, b) => Number(a.reasons.includes('tracked generated/system state')) - Number(b.reasons.includes('tracked generated/system state')));
      for (const { file, reasons } of findings.slice(0, 20)) console.error(`${file}: ${reasons.join(', ')}`);
      process.exitCode = 1;
    } else {
      console.log(`Release security policy passed for ${trackedCount} tracked files. This is not a full security certification.`);
    }
  } catch {
    console.error('Release security policy could not inspect every tracked source file. No pass is recorded.');
    process.exitCode = 1;
  }
}
