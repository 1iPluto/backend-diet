import type { PackageEntry } from '../../types.js';

export const uuid: PackageEntry = {
  packageName: 'uuid',
  description: 'RFC4122 UUIDs generator.',
  gzippedSize: 3_700,
  canFullyReplace: true,
  functions: [
    {
      name: 'v4',
      importPaths: ['uuid/v4'],
      alternatives: [
        {
          api: 'crypto.randomUUID',
          minNodeVersion: '14.17.0',
          bytesSaved: 3_700,
          difficulty: 'trivial',
          docsUrl: 'https://nodejs.org/api/crypto.html#cryptorandomuuidoptions',
          snippet: {
            before: `import { v4 as uuidv4 } from 'uuid';\nconst id = uuidv4();`,
            after: `const id = crypto.randomUUID();`,
          },
        },
      ],
    },
    {
      name: 'v1',
      importPaths: ['uuid/v1'],
      alternatives: [
        {
          api: 'crypto.randomUUID (v4 alternative)',
          minNodeVersion: '14.17.0',
          bytesSaved: 3_700,
          difficulty: 'easy',
          snippet: {
            before: `import { v1 as uuidv1 } from 'uuid';\nconst id = uuidv1();`,
            after: `// v1 (timestamp-based) has no direct native equivalent.\n// If timestamp ordering isn't required, use:\nconst id = crypto.randomUUID();`,
          },
        },
      ],
    },
  ],
};
