import type { PackageEntry } from '../../types.js';

export const lodash: PackageEntry = {
  packageName: 'lodash',
  description: 'A modern JavaScript utility library delivering modularity, performance & extras.',
  gzippedSize: 24_000,
  canFullyReplace: true,
  functions: [
    {
      name: 'cloneDeep',
      importPaths: ['lodash/cloneDeep'],
      alternatives: [
        {
          api: 'structuredClone',
          minNodeVersion: '17.0.0',
          bytesSaved: 3_200,
          difficulty: 'trivial',
          docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/structuredClone',
          snippet: {
            before: `import { cloneDeep } from 'lodash';\nconst copy = cloneDeep(obj);`,
            after: `const copy = structuredClone(obj);`,
          },
        },
      ],
    },
    {
      name: 'merge',
      importPaths: ['lodash/merge'],
      alternatives: [
        {
          api: 'Object.assign / spread',
          minNodeVersion: '4.0.0',
          bytesSaved: 900,
          difficulty: 'easy',
          snippet: {
            before: `import { merge } from 'lodash';\nconst result = merge({}, defaults, overrides);`,
            after: `const result = { ...defaults, ...overrides };`,
          },
        },
      ],
    },
    {
      name: 'get',
      importPaths: ['lodash/get'],
      alternatives: [
        {
          api: 'Optional Chaining (?.)',
          minNodeVersion: '14.0.0',
          bytesSaved: 700,
          difficulty: 'trivial',
          docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
          snippet: {
            before: `import { get } from 'lodash';\nconst val = get(obj, 'a.b.c', defaultVal);`,
            after: `const val = obj?.a?.b?.c ?? defaultVal;`,
          },
        },
      ],
    },
    {
      name: 'flatten',
      importPaths: ['lodash/flatten'],
      alternatives: [
        {
          api: 'Array.prototype.flat',
          minNodeVersion: '11.0.0',
          bytesSaved: 400,
          difficulty: 'trivial',
          docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat',
          snippet: {
            before: `import { flatten } from 'lodash';\nconst flat = flatten(arr);`,
            after: `const flat = arr.flat();`,
          },
        },
      ],
    },
    {
      name: 'flattenDeep',
      importPaths: ['lodash/flattenDeep'],
      alternatives: [
        {
          api: 'Array.prototype.flat(Infinity)',
          minNodeVersion: '11.0.0',
          bytesSaved: 500,
          difficulty: 'trivial',
          snippet: {
            before: `import { flattenDeep } from 'lodash';\nconst flat = flattenDeep(arr);`,
            after: `const flat = arr.flat(Infinity);`,
          },
        },
      ],
    },
    {
      name: 'uniq',
      importPaths: ['lodash/uniq'],
      alternatives: [
        {
          api: 'Set',
          minNodeVersion: '4.0.0',
          bytesSaved: 350,
          difficulty: 'trivial',
          snippet: {
            before: `import { uniq } from 'lodash';\nconst unique = uniq(arr);`,
            after: `const unique = [...new Set(arr)];`,
          },
        },
      ],
    },
    {
      name: 'uniqBy',
      importPaths: ['lodash/uniqBy'],
      alternatives: [
        {
          api: 'Map + Array.from',
          minNodeVersion: '4.0.0',
          bytesSaved: 450,
          difficulty: 'easy',
          snippet: {
            before: `import { uniqBy } from 'lodash';\nconst unique = uniqBy(arr, (x) => x.id);`,
            after: `const unique = Array.from(new Map(arr.map((x) => [x.id, x])).values());`,
          },
        },
      ],
    },
    {
      name: 'debounce',
      importPaths: ['lodash/debounce'],
      alternatives: [
        {
          api: 'Custom closure',
          minNodeVersion: '4.0.0',
          bytesSaved: 600,
          difficulty: 'easy',
          snippet: {
            before: `import { debounce } from 'lodash';\nconst handler = debounce(fn, 300);`,
            after: `function debounce(fn, ms) {\n  let timer;\n  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };\n}\nconst handler = debounce(fn, 300);`,
          },
        },
      ],
    },
    {
      name: 'throttle',
      importPaths: ['lodash/throttle'],
      alternatives: [
        {
          api: 'Custom closure',
          minNodeVersion: '4.0.0',
          bytesSaved: 600,
          difficulty: 'easy',
          snippet: {
            before: `import { throttle } from 'lodash';\nconst handler = throttle(fn, 300);`,
            after: `function throttle(fn, ms) {\n  let last = 0;\n  return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } };\n}\nconst handler = throttle(fn, 300);`,
          },
        },
      ],
    },
    {
      name: 'isEmpty',
      importPaths: ['lodash/isEmpty'],
      alternatives: [
        {
          api: 'Native checks',
          minNodeVersion: '4.0.0',
          bytesSaved: 300,
          difficulty: 'easy',
          snippet: {
            before: `import { isEmpty } from 'lodash';\nif (isEmpty(value)) { ... }`,
            after: `// For arrays:\nif (!arr.length) { ... }\n// For objects:\nif (!Object.keys(obj).length) { ... }\n// For strings:\nif (!str) { ... }`,
          },
        },
      ],
    },
    {
      name: 'isEqual',
      importPaths: ['lodash/isEqual'],
      alternatives: [
        {
          api: 'JSON.stringify (shallow use case)',
          minNodeVersion: '4.0.0',
          bytesSaved: 800,
          difficulty: 'moderate',
          snippet: {
            before: `import { isEqual } from 'lodash';\nif (isEqual(a, b)) { ... }`,
            after: `// For simple serializable objects (no functions/undefined):\nif (JSON.stringify(a) === JSON.stringify(b)) { ... }\n// For deep equality with full support, keep lodash.isEqual.`,
          },
        },
      ],
    },
    {
      name: 'omit',
      importPaths: ['lodash/omit'],
      alternatives: [
        {
          api: 'Destructuring',
          minNodeVersion: '6.0.0',
          bytesSaved: 350,
          difficulty: 'easy',
          snippet: {
            before: `import { omit } from 'lodash';\nconst clean = omit(obj, ['password', 'token']);`,
            after: `const { password, token, ...clean } = obj;`,
          },
        },
      ],
    },
    {
      name: 'pick',
      importPaths: ['lodash/pick'],
      alternatives: [
        {
          api: 'Object.fromEntries',
          minNodeVersion: '12.0.0',
          bytesSaved: 350,
          difficulty: 'easy',
          snippet: {
            before: `import { pick } from 'lodash';\nconst subset = pick(obj, ['name', 'age']);`,
            after: `const keys = ['name', 'age'];\nconst subset = Object.fromEntries(keys.map((k) => [k, obj[k]]));`,
          },
        },
      ],
    },
    {
      name: 'chunk',
      importPaths: ['lodash/chunk'],
      alternatives: [
        {
          api: 'Array.from + slice',
          minNodeVersion: '4.0.0',
          bytesSaved: 400,
          difficulty: 'easy',
          snippet: {
            before: `import { chunk } from 'lodash';\nconst chunks = chunk(arr, 3);`,
            after: `const chunk = (arr, size) =>\n  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>\n    arr.slice(i * size, i * size + size)\n  );\nconst chunks = chunk(arr, 3);`,
          },
        },
      ],
    },
    {
      name: 'groupBy',
      importPaths: ['lodash/groupBy'],
      alternatives: [
        {
          api: 'Array.prototype.reduce',
          minNodeVersion: '4.0.0',
          bytesSaved: 500,
          difficulty: 'easy',
          snippet: {
            before: `import { groupBy } from 'lodash';\nconst groups = groupBy(arr, (x) => x.category);`,
            after: `const groups = arr.reduce((acc, x) => {\n  (acc[x.category] ??= []).push(x);\n  return acc;\n}, {});`,
          },
        },
      ],
    },
    {
      name: 'sortBy',
      importPaths: ['lodash/sortBy'],
      alternatives: [
        {
          api: 'Array.prototype.sort',
          minNodeVersion: '4.0.0',
          bytesSaved: 400,
          difficulty: 'easy',
          snippet: {
            before: `import { sortBy } from 'lodash';\nconst sorted = sortBy(arr, (x) => x.name);`,
            after: `const sorted = [...arr].sort((a, b) => a.name.localeCompare(b.name));`,
          },
        },
      ],
    },
    {
      name: 'mapValues',
      importPaths: ['lodash/mapValues'],
      alternatives: [
        {
          api: 'Object.fromEntries + Object.entries',
          minNodeVersion: '12.0.0',
          bytesSaved: 350,
          difficulty: 'easy',
          snippet: {
            before: `import { mapValues } from 'lodash';\nconst result = mapValues(obj, (v) => v * 2);`,
            after: `const result = Object.fromEntries(\n  Object.entries(obj).map(([k, v]) => [k, v * 2])\n);`,
          },
        },
      ],
    },
    {
      name: 'keyBy',
      importPaths: ['lodash/keyBy'],
      alternatives: [
        {
          api: 'Array.prototype.reduce',
          minNodeVersion: '4.0.0',
          bytesSaved: 400,
          difficulty: 'easy',
          snippet: {
            before: `import { keyBy } from 'lodash';\nconst byId = keyBy(users, 'id');`,
            after: `const byId = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});`,
          },
        },
      ],
    },
    {
      name: 'startCase',
      importPaths: ['lodash/startCase'],
      alternatives: [
        {
          api: 'Regex + replace',
          minNodeVersion: '4.0.0',
          bytesSaved: 300,
          difficulty: 'moderate',
          snippet: {
            before: `import { startCase } from 'lodash';\nconst title = startCase('helloWorld');`,
            after: `const startCase = (s) =>\n  s.replace(/([A-Z])/g, ' $1')\n   .replace(/[-_]/g, ' ')\n   .replace(/\\b\\w/g, (c) => c.toUpperCase())\n   .trim();\nconst title = startCase('helloWorld');`,
          },
        },
      ],
    },
    {
      name: 'camelCase',
      importPaths: ['lodash/camelCase'],
      alternatives: [
        {
          api: 'Regex + replace',
          minNodeVersion: '4.0.0',
          bytesSaved: 300,
          difficulty: 'moderate',
          snippet: {
            before: `import { camelCase } from 'lodash';\nconst name = camelCase('hello-world');`,
            after: `const camelCase = (s) =>\n  s.toLowerCase().replace(/[-_\\s]+(\\w)/g, (_, c) => c.toUpperCase());\nconst name = camelCase('hello-world');`,
          },
        },
      ],
    },
  ],
};
