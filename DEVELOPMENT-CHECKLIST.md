# Whee Development Checklist

## Before Making ANY Changes

- [ ] Verify current branch: `git status` (should be clean or your feature branch)
- [ ] Create feature branch: `git checkout -b feature/your-feature-name`
- [ ] Pull latest: `git pull origin main`

## Before Adding Dependencies

- [ ] Check compatibility: Does this package work with Expo 54?
- [ ] Test first: Add to package.json, run `npm install --legacy-peer-deps`
- [ ] Run tests: `npm test -- --no-coverage` (must all pass)
- [ ] Test on device: `npm start -- --clear` + reload app
- [ ] If it breaks anything: `git checkout package.json && npm install --legacy-peer-deps`

## Before Committing

- [ ] Run all tests: `npm test -- --no-coverage`
- [ ] No console.errors (check Metro output)
- [ ] Dev server still runs: `npm start -- --clear`
- [ ] App loads on device without errors

## Commit Message Format

```
type: subject line (50 chars max)

Longer description explaining:
- What changed
- Why it changed
- Any new dependencies or version changes

Avoid:
- Changing multiple unrelated things
- Removing files without explanation
- Upgrading versions without testing
```

Types:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring (no behavior change)
- `deps:` Dependency updates (test thoroughly!)
- `docs:` Documentation only

## Emergency: Something Broke

**Option 1 — Revert last commit:**
```bash
git log --oneline -5          # See recent commits
git revert <commit-hash>      # Creates undo commit
npm install --legacy-peer-deps
npm start -- --clear
```

**Option 2 — Go back to stable baseline:**
```bash
git checkout v0.1.0-stable
npm install --legacy-peer-deps
npm test
npm start -- --clear
# Then: git checkout main && debug what went wrong
```

**Option 3 — Reset file to last commit:**
```bash
git checkout -- <filename>    # Undo changes to one file
npm install --legacy-peer-deps
```

## If Metro Bundler Hangs

```bash
# Kill all node processes
taskkill /F /IM node.exe
# Clear caches
rm -r node_modules/.cache .expo/cache
# Reinstall and restart
npm install --legacy-peer-deps
npm start -- --clear
```

## Version Lock Rules

**NEVER change without approval:**
- react, react-dom, react-native versions
- expo major version (54.x.x)
- babel-preset-expo

**SAFE to update:**
- Non-core dependencies (React Query, Zustand, etc.)
- Dev dependencies (testing, linting tools)
- But always test after updating!

## Questions Before Making Major Changes?

Refer to:
- `/memories/repo/stable-baseline-v0.1.0.md` — Critical versions & entry points
- `docs/PRODUCT-SPEC.md` — What we're building
- `.github/copilot-instructions.md` — Tech stack & conventions
- `.github/instructions/*.md` — Domain-specific rules
