import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import fs from 'fs';
import path from 'path';
import type { ImportRecord } from '../types.js';

const BABEL_PLUGINS: babelParser.ParserPlugin[] = [
  'typescript',
  'jsx',
  ['decorators', { decoratorsBeforeExport: true }],
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'dynamicImport',
  'nullishCoalescingOperator',
  'optionalChaining',
  'optionalCatchBinding',
  'logicalAssignment',
  'numericSeparator',
  'bigInt',
  'importMeta',
];

function safeParseCode(code: string): ReturnType<typeof babelParser.parse> | null {
  try {
    return babelParser.parse(code, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      plugins: BABEL_PLUGINS,
      errorRecovery: true,
    });
  } catch {
    try {
      return babelParser.parse(code, {
        sourceType: 'script',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: ['jsx', 'classProperties'],
        errorRecovery: true,
      });
    } catch {
      return null;
    }
  }
}

function normalizePackageName(source: string): string {
  // "lodash/cloneDeep" → "lodash"
  // "@scope/pkg/sub" → "@scope/pkg"
  if (source.startsWith('@')) {
    const parts = source.split('/');
    return parts.slice(0, 2).join('/');
  }
  return source.split('/')[0];
}

function getSubPath(source: string): string | null {
  // "lodash/cloneDeep" → "cloneDeep"
  const parts = source.split('/');
  if (source.startsWith('@') && parts.length > 2) {
    return parts.slice(2).join('/');
  }
  if (!source.startsWith('@') && parts.length > 1) {
    return parts.slice(1).join('/');
  }
  return null;
}

export function parseFile(filePath: string): ImportRecord[] {
  const records: ImportRecord[] = [];
  let code: string;

  try {
    code = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return records;
  }

  const ast = safeParseCode(code);
  if (!ast) return records;

  const relPath = path.relative(process.cwd(), filePath);

  traverse(ast, {
    // Pattern 1: import { cloneDeep, merge } from 'lodash'
    // Pattern 2: import cloneDeep from 'lodash/cloneDeep'
    ImportDeclaration(nodePath) {
      const source = nodePath.node.source.value;
      if (!isThirdParty(source)) return;

      const packageName = normalizePackageName(source);
      const subPath = getSubPath(source);
      const line = nodePath.node.loc?.start.line ?? 0;
      const col = nodePath.node.loc?.start.column ?? 0;
      const raw = code.split('\n')[line - 1]?.trim() ?? '';

      for (const specifier of nodePath.node.specifiers) {
        let functionName: string;

        if (t.isImportSpecifier(specifier)) {
          // import { cloneDeep as cd } from 'lodash'
          functionName = t.isIdentifier(specifier.imported)
            ? specifier.imported.name
            : specifier.imported.value;
        } else if (t.isImportDefaultSpecifier(specifier)) {
          // import cloneDeep from 'lodash/cloneDeep'
          functionName = subPath ?? specifier.local.name;
        } else if (t.isImportNamespaceSpecifier(specifier)) {
          // import * as _ from 'lodash' — record the namespace
          functionName = '*';
        } else {
          continue;
        }

        records.push({ file: relPath, packageName, functionName, line, col, raw });
      }
    },

    // Pattern 3: const { cloneDeep } = require('lodash')
    VariableDeclarator(nodePath) {
      const init = nodePath.node.init;
      if (!t.isCallExpression(init)) return;
      if (!t.isIdentifier(init.callee, { name: 'require' })) return;
      if (init.arguments.length === 0) return;

      const arg = init.arguments[0];
      if (!t.isStringLiteral(arg)) return;
      if (!isThirdParty(arg.value)) return;

      const source = arg.value;
      const packageName = normalizePackageName(source);
      const subPath = getSubPath(source);
      const line = nodePath.node.loc?.start.line ?? 0;
      const col = nodePath.node.loc?.start.column ?? 0;
      const raw = code.split('\n')[line - 1]?.trim() ?? '';

      if (t.isObjectPattern(nodePath.node.id)) {
        // const { cloneDeep, merge } = require('lodash')
        for (const prop of nodePath.node.id.properties) {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            records.push({
              file: relPath,
              packageName,
              functionName: prop.key.name,
              line,
              col,
              raw,
            });
          }
        }
      } else if (t.isIdentifier(nodePath.node.id)) {
        // const _ = require('lodash')
        const functionName = subPath ?? '*';
        records.push({ file: relPath, packageName, functionName, line, col, raw });
      }
    },

    // Pattern 4: _.cloneDeep(obj) — namespace call detection
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;
      if (!t.isMemberExpression(callee)) return;
      if (!t.isIdentifier(callee.object)) return;
      if (!t.isIdentifier(callee.property)) return;

      // We can't know if `_` is lodash without scope analysis,
      // so we record it with a special marker and let the database
      // matcher resolve it via namespace import tracking.
      const nsName = callee.object.name;
      const methodName = callee.property.name;

      // Only record if we saw a namespace import for this identifier
      // (this is handled in the match phase via the '*' functionName records)
      const line = nodePath.node.loc?.start.line ?? 0;
      const col = nodePath.node.loc?.start.column ?? 0;
      const raw = code.split('\n')[line - 1]?.trim() ?? '';

      records.push({
        file: relPath,
        packageName: `__ns__${nsName}`,
        functionName: methodName,
        line,
        col,
        raw,
      });
    },
  });

  return records;
}

function isThirdParty(source: string): boolean {
  if (source.startsWith('.')) return false;
  if (source.startsWith('/')) return false;
  if (source.startsWith('node:')) return false;
  // Built-in Node modules
  const builtins = new Set([
    'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'util',
    'stream', 'child_process', 'cluster', 'events', 'net', 'tls',
    'dns', 'readline', 'repl', 'vm', 'zlib', 'buffer', 'assert',
    'perf_hooks', 'worker_threads', 'module', 'process', 'v8', 'inspector',
  ]);
  return !builtins.has(source.split('/')[0]);
}

export async function parseFiles(files: string[]): Promise<ImportRecord[]> {
  const allRecords: ImportRecord[] = [];
  for (const file of files) {
    const records = parseFile(file);
    allRecords.push(...records);
  }
  return allRecords;
}
