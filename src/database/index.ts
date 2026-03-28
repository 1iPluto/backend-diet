import type { PackageEntry, FunctionEntry, Match, ImportRecord } from '../types.js';
import { lodash } from './packs/lodash.js';
import { moment } from './packs/moment.js';
import { axios } from './packs/axios.js';
import { uuid } from './packs/uuid.js';
import { bluebird } from './packs/bluebird.js';
import { underscore } from './packs/underscore.js';

const ALL_PACKAGES: PackageEntry[] = [lodash, moment, axios, uuid, bluebird, underscore];

const packageRegistry = new Map<string, PackageEntry>();
const functionRegistry = new Map<string, Map<string, FunctionEntry>>();
const subPathRegistry = new Map<string, { packageName: string; functionName: string }>();

for (const pkg of ALL_PACKAGES) {
  packageRegistry.set(pkg.packageName, pkg);
  const fnMap = new Map<string, FunctionEntry>();

  for (const fn of pkg.functions) {
    fnMap.set(fn.name, fn);
    if (fn.importPaths) {
      for (const subPath of fn.importPaths) {
        subPathRegistry.set(subPath, { packageName: pkg.packageName, functionName: fn.name });
      }
    }
  }

  functionRegistry.set(pkg.packageName, fnMap);
}

export function lookupPackage(packageName: string): PackageEntry | undefined {
  return packageRegistry.get(packageName);
}

export function lookupFunction(packageName: string, functionName: string): FunctionEntry | undefined {
  return functionRegistry.get(packageName)?.get(functionName);
}

export function lookupSubPath(subPath: string): { packageName: string; functionName: string } | undefined {
  return subPathRegistry.get(subPath);
}

export function getAllPackages(): PackageEntry[] {
  return ALL_PACKAGES;
}

/**
 * Resolve namespace usages. When a file has `import * as _ from 'lodash'`,
 * we track it as a '*' import. Subsequent `__ns__<name>.method` calls
 * are then linked back to the package.
 */
export function matchImports(imports: ImportRecord[]): Match[] {
  const matches: Match[] = [];

  // Build namespace identifier → package map
  // e.g. `import * as _ from 'lodash'` creates ns record with packageName='lodash', functionName='*'
  // `_.cloneDeep()` creates ns record with packageName='__ns___', functionName='cloneDeep'
  const namespaceToPackage = new Map<string, string>();
  for (const rec of imports) {
    if (rec.functionName === '*' && !rec.packageName.startsWith('__ns__')) {
      // We need the local identifier — it's encoded in subsequent ns calls
      // The ns identifier is keyed to the package
      namespaceToPackage.set(rec.packageName, rec.packageName);
    }
  }

  // Build a map of local alias → packageName from namespace imports
  // We reconstruct this from the '*' records and match __ns__ records by file
  const fileNsMap = new Map<string, Map<string, string>>();
  for (const rec of imports) {
    if (rec.functionName === '*' && !rec.packageName.startsWith('__ns__')) {
      // We need the local identifier name — not available directly in current schema
      // Use a heuristic: if the package is lodash/underscore, assume '_' as namespace
      const commonNs = rec.packageName === 'lodash' || rec.packageName === 'underscore' ? '_' : rec.packageName;
      if (!fileNsMap.has(rec.file)) fileNsMap.set(rec.file, new Map());
      fileNsMap.get(rec.file)!.set(commonNs, rec.packageName);
    }
  }

  for (const rec of imports) {
    // Skip internal namespace tracking records
    if (rec.functionName === '*') continue;

    let packageName = rec.packageName;
    let functionName = rec.functionName;

    // Resolve namespace calls: __ns__<identifier>
    if (packageName.startsWith('__ns__')) {
      const nsId = packageName.replace('__ns__', '');
      const filePkg = fileNsMap.get(rec.file)?.get(nsId);
      if (!filePkg) continue;
      packageName = filePkg;
    }

    // Try direct lookup
    let pkgEntry = lookupPackage(packageName);
    let fnEntry = pkgEntry ? lookupFunction(packageName, functionName) : undefined;

    // Try sub-path lookup (e.g. "lodash/cloneDeep")
    if (!fnEntry) {
      const subPathKey = `${packageName}/${functionName}`;
      const resolved = lookupSubPath(subPathKey);
      if (resolved) {
        pkgEntry = lookupPackage(resolved.packageName);
        fnEntry = pkgEntry ? lookupFunction(resolved.packageName, resolved.functionName) : undefined;
        if (pkgEntry) packageName = resolved.packageName;
        if (fnEntry) functionName = resolved.functionName;
      }
    }

    // Try 'default' entry for default imports
    if (!fnEntry && pkgEntry) {
      fnEntry = lookupFunction(packageName, 'default');
    }

    if (!pkgEntry || !fnEntry) continue;

    matches.push({
      importRecord: { ...rec, packageName, functionName },
      packageEntry: pkgEntry,
      functionEntry: fnEntry,
    });
  }

  // Deduplicate: one match per (file, packageName, functionName) combo
  const seen = new Set<string>();
  return matches.filter((m) => {
    const key = `${m.importRecord.file}::${m.importRecord.packageName}::${m.importRecord.functionName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
