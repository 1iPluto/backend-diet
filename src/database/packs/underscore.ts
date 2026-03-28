import type { PackageEntry } from '../../types.js';

export const underscore: PackageEntry = {
  packageName: 'underscore',
  description: 'A JavaScript utility library providing lots of useful functional programming helpers.',
  gzippedSize: 6_800,
  canFullyReplace: true,
  functions: [
    {
      name: 'each',
      alternatives: [
        {
          api: 'Array.prototype.forEach',
          minNodeVersion: '4.0.0',
          bytesSaved: 400,
          difficulty: 'trivial',
          snippet: {
            before: `import _ from 'underscore';\n_.each(arr, (item) => console.log(item));`,
            after: `arr.forEach((item) => console.log(item));`,
          },
        },
      ],
    },
    {
      name: 'map',
      alternatives: [
        {
          api: 'Array.prototype.map',
          minNodeVersion: '4.0.0',
          bytesSaved: 400,
          difficulty: 'trivial',
          snippet: {
            before: `_.map(arr, (x) => x * 2)`,
            after: `arr.map((x) => x * 2)`,
          },
        },
      ],
    },
    {
      name: 'filter',
      alternatives: [
        {
          api: 'Array.prototype.filter',
          minNodeVersion: '4.0.0',
          bytesSaved: 300,
          difficulty: 'trivial',
          snippet: {
            before: `_.filter(arr, (x) => x > 0)`,
            after: `arr.filter((x) => x > 0)`,
          },
        },
      ],
    },
    {
      name: 'reduce',
      alternatives: [
        {
          api: 'Array.prototype.reduce',
          minNodeVersion: '4.0.0',
          bytesSaved: 300,
          difficulty: 'trivial',
          snippet: {
            before: `_.reduce(arr, (acc, x) => acc + x, 0)`,
            after: `arr.reduce((acc, x) => acc + x, 0)`,
          },
        },
      ],
    },
    {
      name: 'find',
      alternatives: [
        {
          api: 'Array.prototype.find',
          minNodeVersion: '4.0.0',
          bytesSaved: 300,
          difficulty: 'trivial',
          snippet: {
            before: `_.find(arr, (x) => x.id === id)`,
            after: `arr.find((x) => x.id === id)`,
          },
        },
      ],
    },
    {
      name: 'contains',
      alternatives: [
        {
          api: 'Array.prototype.includes',
          minNodeVersion: '6.0.0',
          bytesSaved: 200,
          difficulty: 'trivial',
          snippet: {
            before: `_.contains(arr, value)`,
            after: `arr.includes(value)`,
          },
        },
      ],
    },
    {
      name: 'keys',
      alternatives: [
        {
          api: 'Object.keys',
          minNodeVersion: '4.0.0',
          bytesSaved: 200,
          difficulty: 'trivial',
          snippet: {
            before: `_.keys(obj)`,
            after: `Object.keys(obj)`,
          },
        },
      ],
    },
    {
      name: 'values',
      alternatives: [
        {
          api: 'Object.values',
          minNodeVersion: '7.0.0',
          bytesSaved: 200,
          difficulty: 'trivial',
          snippet: {
            before: `_.values(obj)`,
            after: `Object.values(obj)`,
          },
        },
      ],
    },
    {
      name: 'extend',
      alternatives: [
        {
          api: 'Object.assign',
          minNodeVersion: '4.0.0',
          bytesSaved: 200,
          difficulty: 'trivial',
          snippet: {
            before: `_.extend(target, source)`,
            after: `Object.assign(target, source)`,
          },
        },
      ],
    },
    {
      name: 'clone',
      alternatives: [
        {
          api: 'structuredClone / spread',
          minNodeVersion: '17.0.0',
          bytesSaved: 300,
          difficulty: 'trivial',
          snippet: {
            before: `_.clone(obj)`,
            after: `structuredClone(obj)  // deep clone\n// or { ...obj } for shallow`,
          },
        },
      ],
    },
    {
      name: 'flatten',
      alternatives: [
        {
          api: 'Array.prototype.flat',
          minNodeVersion: '11.0.0',
          bytesSaved: 300,
          difficulty: 'trivial',
          snippet: {
            before: `_.flatten(arr)`,
            after: `arr.flat()`,
          },
        },
      ],
    },
    {
      name: 'uniq',
      alternatives: [
        {
          api: 'Set',
          minNodeVersion: '4.0.0',
          bytesSaved: 250,
          difficulty: 'trivial',
          snippet: {
            before: `_.uniq(arr)`,
            after: `[...new Set(arr)]`,
          },
        },
      ],
    },
  ],
};
