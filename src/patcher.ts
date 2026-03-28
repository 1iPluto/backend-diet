import fs from 'fs';
import path from 'path';
import type { Match, PatchResult } from './types.js';

/**
 * For each match with difficulty='trivial', attempt to rewrite the source file
 * by replacing the import line with the native alternative.
 *
 * In dry-run mode (apply=false), only computes what WOULD be changed.
 * In apply mode (apply=true), writes the changes back to disk.
 */
export function computePatches(matches: Match[], targetDir: string): PatchResult[] {
  const results: PatchResult[] = [];

  // Only patch trivial replacements
  const trivial = matches.filter((m) =>
    m.functionEntry.alternatives.some((a) => a.difficulty === 'trivial')
  );

  // Group by file to batch edits
  const byFile = new Map<string, Match[]>();
  for (const m of trivial) {
    const absFile = path.resolve(targetDir, m.importRecord.file);
    if (!byFile.has(absFile)) byFile.set(absFile, []);
    byFile.get(absFile)!.push(m);
  }

  for (const [absFile, fileMatches] of byFile) {
    let source: string;
    try {
      source = fs.readFileSync(absFile, 'utf-8');
    } catch {
      continue;
    }

    const lines = source.split('\n');

    for (const match of fileMatches) {
      const alt = match.functionEntry.alternatives.find((a) => a.difficulty === 'trivial');
      if (!alt) continue;

      const lineIdx = match.importRecord.line - 1;
      const originalLine = lines[lineIdx];
      if (originalLine === undefined) continue;

      results.push({
        file: match.importRecord.file,
        originalLine: match.importRecord.line,
        before: originalLine,
        after: alt.snippet.after,
        applied: false,
      });
    }
  }

  return results;
}

export function applyPatches(patches: PatchResult[], targetDir: string): PatchResult[] {
  // Group by file
  const byFile = new Map<string, PatchResult[]>();
  for (const p of patches) {
    const absFile = path.resolve(targetDir, p.file);
    if (!byFile.has(absFile)) byFile.set(absFile, []);
    byFile.get(absFile)!.push(p);
  }

  const applied: PatchResult[] = [];

  for (const [absFile, filePatches] of byFile) {
    let source: string;
    try {
      source = fs.readFileSync(absFile, 'utf-8');
    } catch {
      continue;
    }

    let modified = source;
    for (const patch of filePatches) {
      if (modified.includes(patch.before)) {
        modified = modified.replace(patch.before, patch.after);
        applied.push({ ...patch, applied: true });
      }
    }

    try {
      fs.writeFileSync(absFile, modified, 'utf-8');
    } catch {
      // Skip files we can't write
    }
  }

  return applied;
}
