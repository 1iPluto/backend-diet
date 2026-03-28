# Contributing to backend-diet

Thank you for helping put the JavaScript ecosystem on a diet!

## Adding a Package to the Diet Database

The most impactful contribution you can make is adding a new package entry.

### Step 1 — Create the pack file

```bash
touch src/database/packs/<package-name>.ts
```

### Step 2 — Implement the `PackageEntry`

```typescript
import type { PackageEntry } from '../../types.js';

export const myPackage: PackageEntry = {
  packageName: 'my-heavy-package',
  description: 'What this package does.',
  gzippedSize: 15_000,  // bytes — check bundlephobia.com
  canFullyReplace: true,
  functions: [
    {
      name: 'someFunction',
      importPaths: ['my-heavy-package/someFunction'],  // optional sub-paths
      alternatives: [
        {
          api: 'Native API name',
          minNodeVersion: '18.0.0',
          bytesSaved: 15_000,
          difficulty: 'trivial',  // trivial | easy | moderate | hard
          docsUrl: 'https://mdn.io/...',
          snippet: {
            before: `import { someFunction } from 'my-heavy-package';\nconst result = someFunction(x);`,
            after: `const result = nativeEquivalent(x);`,
          },
        },
      ],
    },
  ],
};
```

### Step 3 — Register it

In `src/database/index.ts`, add:

```typescript
import { myPackage } from './packs/my-package.js';

const ALL_PACKAGES: PackageEntry[] = [
  lodash, moment, axios, uuid, bluebird, underscore,
  myPackage,  // <-- add here
];
```

### Step 4 — Open a PR

Title format: `feat: add <package-name> to diet database`

Include in the PR description:
- Bundlephobia link for the package
- Which Node.js version introduced the native alternative
- Whether the snippet was tested

## Difficulty Guide

| Level | Meaning |
|---|---|
| `trivial` | Direct 1-line swap, no logic change, eligible for `--fix` auto-patch |
| `easy` | 1-5 lines, straightforward migration |
| `moderate` | Requires understanding the use case, multiple patterns |
| `hard` | Significant refactoring, not worth auto-patching |

Only `trivial` entries are eligible for `--fix` auto-patching.

## Commit Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add date-fns to diet database
fix: false positive on lodash namespace imports
docs: improve CONTRIBUTING guide
```
