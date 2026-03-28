import type { PackageEntry } from '../../types.js';

export const moment: PackageEntry = {
  packageName: 'moment',
  description: 'Parse, validate, manipulate, and display dates in JavaScript.',
  gzippedSize: 72_000,
  canFullyReplace: true,
  functions: [
    {
      name: 'default',
      alternatives: [
        {
          api: 'Intl.DateTimeFormat / Date',
          minNodeVersion: '12.0.0',
          bytesSaved: 72_000,
          difficulty: 'moderate',
          docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat',
          snippet: {
            before: `import moment from 'moment';\nconst formatted = moment().format('YYYY-MM-DD');`,
            after: `const formatted = new Date().toISOString().slice(0, 10);\n// Or with Intl:\nconst formatted = new Intl.DateTimeFormat('en-CA').format(new Date());`,
          },
        },
      ],
    },
    {
      name: 'format',
      alternatives: [
        {
          api: 'Intl.DateTimeFormat',
          minNodeVersion: '12.0.0',
          bytesSaved: 72_000,
          difficulty: 'moderate',
          docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat',
          snippet: {
            before: `moment(date).format('MMM D, YYYY')`,
            after: `new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)`,
          },
        },
      ],
    },
    {
      name: 'diff',
      alternatives: [
        {
          api: 'Date arithmetic',
          minNodeVersion: '4.0.0',
          bytesSaved: 5_000,
          difficulty: 'easy',
          snippet: {
            before: `moment(end).diff(moment(start), 'days')`,
            after: `Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))`,
          },
        },
      ],
    },
    {
      name: 'add',
      alternatives: [
        {
          api: 'Date manipulation',
          minNodeVersion: '4.0.0',
          bytesSaved: 3_000,
          difficulty: 'easy',
          snippet: {
            before: `moment().add(7, 'days').toDate()`,
            after: `const d = new Date();\nd.setDate(d.getDate() + 7);`,
          },
        },
      ],
    },
    {
      name: 'fromNow',
      alternatives: [
        {
          api: 'Intl.RelativeTimeFormat',
          minNodeVersion: '12.0.0',
          bytesSaved: 5_000,
          difficulty: 'moderate',
          docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat',
          snippet: {
            before: `moment(date).fromNow()`,
            after: `const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });\nconst diffMs = date - Date.now();\nconst diffDays = Math.round(diffMs / 86_400_000);\nrtf.format(diffDays, 'day');`,
          },
        },
      ],
    },
    {
      name: 'isBefore',
      alternatives: [
        {
          api: 'Date comparison',
          minNodeVersion: '4.0.0',
          bytesSaved: 1_000,
          difficulty: 'trivial',
          snippet: {
            before: `moment(a).isBefore(moment(b))`,
            after: `new Date(a) < new Date(b)`,
          },
        },
      ],
    },
    {
      name: 'isAfter',
      alternatives: [
        {
          api: 'Date comparison',
          minNodeVersion: '4.0.0',
          bytesSaved: 1_000,
          difficulty: 'trivial',
          snippet: {
            before: `moment(a).isAfter(moment(b))`,
            after: `new Date(a) > new Date(b)`,
          },
        },
      ],
    },
    {
      name: 'unix',
      alternatives: [
        {
          api: 'Date.now() / 1000',
          minNodeVersion: '4.0.0',
          bytesSaved: 500,
          difficulty: 'trivial',
          snippet: {
            before: `moment().unix()`,
            after: `Math.floor(Date.now() / 1000)`,
          },
        },
      ],
    },
    {
      name: 'utc',
      alternatives: [
        {
          api: 'toUTCString / toISOString',
          minNodeVersion: '4.0.0',
          bytesSaved: 1_000,
          difficulty: 'easy',
          snippet: {
            before: `moment.utc(date).format()`,
            after: `new Date(date).toISOString()`,
          },
        },
      ],
    },
  ],
};
