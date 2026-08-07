## Change

Describe the smallest intended change and the canonical component/repository it affects.

## Evidence checklist

- [ ] Reused/repaired existing implementation before creating anything new
- [ ] No unrelated runtime or production change included
- [ ] Lint passes
- [ ] Production build passes
- [ ] npm audit gate passes
- [ ] Semgrep passes
- [ ] OSV dependency scan passes
- [ ] Deployment/runtime evidence attached when claiming `live`
- [ ] Rollback/blocker recorded when applicable
- [ ] FACTORY registry/evidence updated if canonical status changed

## Release gate

Do not merge to `main` or create a semantic release tag until all required checks are green and the target Golden Baseline is independently verified.
