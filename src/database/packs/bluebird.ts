import type { PackageEntry } from '../../types.js';

export const bluebird: PackageEntry = {
  packageName: 'bluebird',
  description: 'A full featured promise library with unmatched performance.',
  gzippedSize: 17_000,
  canFullyReplace: true,
  functions: [
    {
      name: 'default',
      alternatives: [
        {
          api: 'Native Promise',
          minNodeVersion: '4.0.0',
          bytesSaved: 17_000,
          difficulty: 'moderate',
          docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
          snippet: {
            before: `const Promise = require('bluebird');\nconst result = new Promise((resolve) => resolve(42));`,
            after: `const result = Promise.resolve(42);`,
          },
        },
      ],
    },
    {
      name: 'all',
      alternatives: [
        {
          api: 'Promise.all',
          minNodeVersion: '4.0.0',
          bytesSaved: 2_000,
          difficulty: 'trivial',
          snippet: {
            before: `Promise.all([p1, p2, p3])`,
            after: `Promise.all([p1, p2, p3])  // Native — same API!`,
          },
        },
      ],
    },
    {
      name: 'map',
      alternatives: [
        {
          api: 'Promise.all + Array.map',
          minNodeVersion: '4.0.0',
          bytesSaved: 1_500,
          difficulty: 'easy',
          snippet: {
            before: `import Promise from 'bluebird';\nawait Promise.map(ids, fetchUser, { concurrency: 3 });`,
            after: `// Simple version (no concurrency limit):\nawait Promise.all(ids.map(fetchUser));\n\n// With concurrency control (p-limit):\nimport pLimit from 'p-limit';\nconst limit = pLimit(3);\nawait Promise.all(ids.map((id) => limit(() => fetchUser(id))));`,
          },
        },
      ],
    },
    {
      name: 'mapSeries',
      alternatives: [
        {
          api: 'for...of + await',
          minNodeVersion: '10.0.0',
          bytesSaved: 1_200,
          difficulty: 'easy',
          snippet: {
            before: `await Promise.mapSeries(items, processItem);`,
            after: `const results = [];\nfor (const item of items) {\n  results.push(await processItem(item));\n}`,
          },
        },
      ],
    },
    {
      name: 'filter',
      alternatives: [
        {
          api: 'Promise.all + Array.filter',
          minNodeVersion: '4.0.0',
          bytesSaved: 1_000,
          difficulty: 'easy',
          snippet: {
            before: `await Promise.filter(items, asyncPredicate);`,
            after: `const flags = await Promise.all(items.map(asyncPredicate));\nconst result = items.filter((_, i) => flags[i]);`,
          },
        },
      ],
    },
    {
      name: 'props',
      alternatives: [
        {
          api: 'Promise.all + Object.fromEntries',
          minNodeVersion: '12.0.0',
          bytesSaved: 1_000,
          difficulty: 'easy',
          snippet: {
            before: `await Promise.props({ user: fetchUser(), posts: fetchPosts() });`,
            after: `const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);\nconst result = { user, posts };`,
          },
        },
      ],
    },
    {
      name: 'each',
      alternatives: [
        {
          api: 'for...of + await',
          minNodeVersion: '10.0.0',
          bytesSaved: 800,
          difficulty: 'easy',
          snippet: {
            before: `await Promise.each(items, async (item) => { await process(item); });`,
            after: `for (const item of items) { await process(item); }`,
          },
        },
      ],
    },
    {
      name: 'any',
      alternatives: [
        {
          api: 'Promise.any',
          minNodeVersion: '15.0.0',
          bytesSaved: 500,
          difficulty: 'trivial',
          snippet: {
            before: `await Promise.any([p1, p2, p3]);`,
            after: `await Promise.any([p1, p2, p3]);  // Native — same API!`,
          },
        },
      ],
    },
    {
      name: 'reflect',
      alternatives: [
        {
          api: 'Promise.allSettled',
          minNodeVersion: '12.9.0',
          bytesSaved: 800,
          difficulty: 'easy',
          snippet: {
            before: `const results = await Promise.all(promises.map((p) => p.reflect()));\nresults.filter((r) => r.isFulfilled());`,
            after: `const results = await Promise.allSettled(promises);\nresults.filter((r) => r.status === 'fulfilled');`,
          },
        },
      ],
    },
  ],
};
