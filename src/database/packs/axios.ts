import type { PackageEntry } from '../../types.js';

export const axios: PackageEntry = {
  packageName: 'axios',
  description: 'Promise based HTTP client for the browser and Node.js.',
  gzippedSize: 14_000,
  canFullyReplace: true,
  functions: [
    {
      name: 'default',
      alternatives: [
        {
          api: 'fetch',
          minNodeVersion: '18.0.0',
          bytesSaved: 14_000,
          difficulty: 'easy',
          docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
          snippet: {
            before: `import axios from 'axios';\nconst { data } = await axios.get('/api/users');`,
            after: `const data = await fetch('/api/users').then((r) => r.json());`,
          },
        },
      ],
    },
    {
      name: 'get',
      alternatives: [
        {
          api: 'fetch',
          minNodeVersion: '18.0.0',
          bytesSaved: 14_000,
          difficulty: 'easy',
          snippet: {
            before: `import axios from 'axios';\nconst { data } = await axios.get(url, { params: { id: 1 } });`,
            after: `const url = new URL('/api/users', baseUrl);\nurl.searchParams.set('id', '1');\nconst data = await fetch(url).then((r) => r.json());`,
          },
        },
      ],
    },
    {
      name: 'post',
      alternatives: [
        {
          api: 'fetch (POST)',
          minNodeVersion: '18.0.0',
          bytesSaved: 14_000,
          difficulty: 'easy',
          snippet: {
            before: `import axios from 'axios';\nawait axios.post('/api/users', { name: 'Alice' });`,
            after: `await fetch('/api/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ name: 'Alice' }),\n});`,
          },
        },
      ],
    },
    {
      name: 'put',
      alternatives: [
        {
          api: 'fetch (PUT)',
          minNodeVersion: '18.0.0',
          bytesSaved: 14_000,
          difficulty: 'easy',
          snippet: {
            before: `await axios.put('/api/users/1', payload);`,
            after: `await fetch('/api/users/1', {\n  method: 'PUT',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(payload),\n});`,
          },
        },
      ],
    },
    {
      name: 'delete',
      alternatives: [
        {
          api: 'fetch (DELETE)',
          minNodeVersion: '18.0.0',
          bytesSaved: 14_000,
          difficulty: 'easy',
          snippet: {
            before: `await axios.delete('/api/users/1');`,
            after: `await fetch('/api/users/1', { method: 'DELETE' });`,
          },
        },
      ],
    },
    {
      name: 'create',
      alternatives: [
        {
          api: 'fetch wrapper',
          minNodeVersion: '18.0.0',
          bytesSaved: 14_000,
          difficulty: 'moderate',
          snippet: {
            before: `const api = axios.create({ baseURL: 'https://api.example.com', timeout: 5000 });`,
            after: `const apiFetch = (path, init = {}) =>\n  fetch(\`https://api.example.com\${path}\`, {\n    signal: AbortSignal.timeout(5000),\n    ...init,\n  }).then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); });`,
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
          bytesSaved: 500,
          difficulty: 'trivial',
          snippet: {
            before: `await axios.all([axios.get('/a'), axios.get('/b')]);`,
            after: `await Promise.all([fetch('/a').then(r => r.json()), fetch('/b').then(r => r.json())]);`,
          },
        },
      ],
    },
  ],
};
