import js from '@eslint/js';

export default [{
  ...js.configs.recommended,
  files: ['scripts/release-security-check.mjs', 'tests/release/**/*.mjs', 'eslint.config.mjs'],
  languageOptions: { globals: { fetch: 'readonly' } },
}];
