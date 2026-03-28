<div align="center">

# backend-diet

**Scan your source code. Find the bloat. Get native alternatives.**

[![npm](https://img.shields.io/npm/v/backend-diet?style=flat-square&color=cb3837)](https://www.npmjs.com/package/backend-diet)
[![npm downloads](https://img.shields.io/npm/dm/backend-diet?style=flat-square&color=cb3837)](https://www.npmjs.com/package/backend-diet)
[![CI](https://img.shields.io/github/actions/workflow/status/1iPluto/backend-diet/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/1iPluto/backend-diet/actions)
[![Node ≥18](https://img.shields.io/badge/node-%E2%89%A518.0.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-3da639?style=flat-square)](LICENSE)

<br />

> Most tools tell you a package is large.  
> **backend-diet tells you exactly what to replace and how.**

<br />

</div>

---

## What is this?

Tools like `depcheck` or `bundle-analyzer` flag large packages — but leave you to figure out the migration yourself. `backend-diet` goes further:

1. Parses your source code using a real AST (Babel) — no regex guessing
2. Identifies *which specific functions* you're importing from heavy packages
3. Suggests modern, native Node.js or Web API alternatives with **copy-paste code snippets**
4. Gives your project a **Refactor Score** and tracks it over time

No config. No setup. Works on any JS/TS/JSX/TSX project.

---

## Quick Start

```bash
# Run instantly — no install needed
npx backend-diet scan

# Or install globally
npm install -g backend-diet
backend-diet scan
```

---

## Usage

```bash
backend-diet scan [directory]          # Scan current dir or a specific path
backend-diet scan --fix                # Preview auto-patches (dry run)
backend-diet scan --fix --yes          # Apply trivial patches in-place
backend-diet scan --badge              # Generate a README badge
backend-diet scan --since HEAD~10      # Show score trend across commits
backend-diet scan --format json        # JSON output for CI pipelines
backend-diet scan --ignore "vendor/**" # Exclude paths
```

---

## Refactor Score

Every scan produces a **0–100 score** based on how much of your dependency weight could be eliminated with native alternatives.

```
Score = 100 − round((removable_bytes / total_dep_bytes) × 100)
```

| Score | Grade | Badge Color |
|---|---|---|
| 90 – 100 | SVELTE | ![](https://img.shields.io/badge/-SVELTE-06b6d4?style=flat-square) |
| 70 – 89 | HEALTHY | ![](https://img.shields.io/badge/-HEALTHY-22c55e?style=flat-square) |
| 40 – 69 | NEEDS WORK | ![](https://img.shields.io/badge/-NEEDS%20WORK-eab308?style=flat-square) |
| 0 – 39 | CRITICAL | ![](https://img.shields.io/badge/-CRITICAL-ef4444?style=flat-square) |

A CRITICAL score causes the process to exit with code `1`, making it useful as a CI gate.

---

## Supported Packages

| Package | Functions Covered | Gzipped Size |
|---|:---:|---:|
| `lodash` | 19 | ~24 KB |
| `moment` | 9 | ~72 KB |
| `axios` | 7 | ~14 KB |
| `bluebird` | 9 | ~17 KB |
| `underscore` | 12 | ~6.8 KB |
| `uuid` | 2 | ~3.7 KB |

---

## Features

### AST-Accurate Detection

Uses `@babel/parser` to walk the real syntax tree — handles all four import patterns with zero false positives:

```ts
import { cloneDeep } from 'lodash'           // named import
import cloneDeep from 'lodash/cloneDeep'     // sub-path import
const { cloneDeep } = require('lodash')      // CommonJS destructure
_.cloneDeep(obj)                             // namespace call
```

---

### Auto-Patch `--fix`

For simple 1-to-1 replacements (`difficulty: trivial`), `backend-diet` can rewrite your source files automatically. It always shows a diff preview first.

```bash
backend-diet scan --fix        # preview only
backend-diet scan --fix --yes  # apply in-place
```

**Example patches applied:**

```diff
- import { v4 as uuidv4 } from 'uuid';
- const id = uuidv4();
+ const id = crypto.randomUUID();
```

```diff
- import { cloneDeep } from 'lodash';
- const copy = cloneDeep(obj);
+ const copy = structuredClone(obj);
```

```diff
- import { get } from 'lodash';
- const val = get(obj, 'a.b.c', defaultVal);
+ const val = obj?.a?.b?.c ?? defaultVal;
```

---

### Badge Generator `--badge`

Paste your project's live diet score directly into your README.

```bash
backend-diet scan --badge
```

Output (paste into your `README.md`):

```md
[![backend-diet](https://img.shields.io/badge/backend--diet-87%25%20lean-brightgreen?style=flat-square)](https://github.com/1iPluto/backend-diet)
```

---

### Time Machine `--since`

Track how your project's weight has changed over time. A `.backend-diet-history.json` file is written on every scan, recording the score, grade, and git SHA.

```bash
backend-diet scan --since HEAD~20
# Score trend: ▁▂▃▃▄▅▅▆▅▄▃  ▼ -8 (getting fatter!)
```

Commit the history file to let your whole team see the trend.

---

### CI Integration `--format json`

```bash
backend-diet scan --format json
```

Outputs a structured JSON report:

```json
{
  "summary": {
    "filesScanned": 42,
    "matchesFound": 9,
    "totalBytesSaved": 89400,
    "totalBytesSavedFormatted": "89.4 KB",
    "refactorScore": 34,
    "grade": "CRITICAL"
  },
  "matches": [ ... ]
}
```

Add it to your GitHub Actions workflow:

```yaml
- name: Dependency diet check
  run: npx backend-diet scan --format json
  # Exits 1 if grade is CRITICAL — blocks the merge
```

---

## Contributing

The diet database is the core of this tool and the easiest place to contribute. Every new package entry helps thousands of developers.

**To add a new package:**

1. Fork the repository
2. Create `src/database/packs/<package-name>.ts`
3. Implement the `PackageEntry` interface (see [`src/types.ts`](src/types.ts))
4. Register it in [`src/database/index.ts`](src/database/index.ts)
5. Open a pull request titled `feat: add <package-name> to diet database`

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full guide, difficulty levels, and code snippet rules.

---

## Tech Stack

| Concern | Tool | Why |
|---|---|---|
| AST parsing | `@babel/parser` + `@babel/traverse` | Handles JS/TS/JSX/TSX in one pass |
| File walking | `fast-glob` | 3–5× faster than `glob` on monorepos |
| CLI | `commander` | Zero dependencies, excellent TS types |
| Terminal UI | `chalk`, `boxen`, `ora`, `cli-table3` | Composable, well-maintained |
| Build | `tsup` | Single-file CJS output in <100ms |

---

## License

MIT © [Marwan Said](https://github.com/1iPluto)
