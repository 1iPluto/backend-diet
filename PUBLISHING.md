# Publishing Guide

## First-Time NPM Setup

```bash
# 1. Create your account at https://npmjs.com
# 2. Log in from the terminal
npm login
# Follow the prompts (username, password, email, OTP if 2FA is enabled)
```

## Publish to NPM

```bash
# Build the project
npm run build

# Dry-run first to see what will be published
npm publish --dry-run

# Publish (the package.json already has "publishConfig": { "access": "public" })
npm publish
```

## Create a GitHub Repository

```bash
# 1. Go to https://github.com/new
#    Name: backend-diet
#    Description: Put your project on a diet. Find heavy packages, get native alternatives.
#    Visibility: Public
#    Do NOT initialize with README (we already have one)

# 2. Initialize git and push
git init
git add .
git commit -m "feat: initial release of backend-diet v1.0.0"
git branch -M main
git remote add origin https://github.com/1iPluto/backend-diet.git
git push -u origin main
```

## Set Up Auto-Publish via GitHub Actions

1. Go to [npmjs.com](https://npmjs.com) → Account Settings → Access Tokens
2. Generate a new token: **Automation** type
3. Copy the token
4. Go to your GitHub repo → Settings → Secrets and variables → Actions
5. Add a new secret: Name = `NPM_TOKEN`, Value = the token you copied

From now on, any `git push` of a tag starting with `v` will automatically publish to npm.

## Release Workflow

```bash
# Bump version and auto-generate CHANGELOG.md
npx standard-version

# This will:
# - Bump version in package.json (e.g. 1.0.0 → 1.1.0)
# - Create a CHANGELOG.md entry
# - Create a git commit: "chore(release): 1.1.0"
# - Create a git tag: v1.1.0

# Push with the tag to trigger GitHub Actions auto-publish
git push --follow-tags origin main
```

## Conventional Commits Reference

| Prefix | When to use |
|---|---|
| `feat:` | New feature (triggers minor version bump) |
| `fix:` | Bug fix (triggers patch version bump) |
| `perf:` | Performance improvement |
| `refactor:` | Code change without feature/fix |
| `docs:` | Documentation only |
| `chore:` | Build, config, deps |
| `test:` | Adding or fixing tests |
| `BREAKING CHANGE:` | In body/footer — triggers major version bump |

### Examples

```bash
git commit -m "feat: add date-fns to diet database"
git commit -m "fix: resolve false positive on lodash namespace imports"
git commit -m "perf: switch file walker from glob to fast-glob"
git commit -m "docs: add Time Machine section to README"
git commit -m "chore: upgrade @babel/traverse to 7.25"
```

## Recommended GitHub Topics

Set these in your repo's About section:
- `cli`
- `nodejs`
- `ast`
- `bundle-size`
- `developer-tools`
- `npm`
- `babel`
- `lodash`
- `performance`
- `refactoring`
