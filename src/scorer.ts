import fs from 'fs';
import path from 'path';
import type { Match, ScanResult, ScoreGrade, ImportRecord } from './types.js';
import { getAllPackages } from './database/index.js';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function loadPackageJson(targetDir: string): PackageJson {
  const pkgPath = path.join(targetDir, 'package.json');
  try {
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    return JSON.parse(raw) as PackageJson;
  } catch {
    return {};
  }
}

function getTotalDepsSize(targetDir: string): number {
  const pkg = loadPackageJson(targetDir);
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const allPkgs = getAllPackages();
  const knownSizes = new Map(allPkgs.map((p) => [p.packageName, p.gzippedSize]));

  let total = 0;
  for (const depName of Object.keys(allDeps)) {
    const size = knownSizes.get(depName);
    if (size) total += size;
  }

  // If we couldn't read any sizes from known packages, use a reasonable baseline
  // so the score is still meaningful
  if (total === 0) {
    total = allPkgs.reduce((sum, p) => sum + p.gzippedSize, 0);
  }

  return total;
}

export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 90) return 'SVELTE';
  if (score >= 70) return 'HEALTHY';
  if (score >= 40) return 'NEEDS WORK';
  return 'CRITICAL';
}

export function computeScore(totalBytesSaved: number, totalDepsSize: number): number {
  if (totalDepsSize === 0) return 100;
  const wasteRatio = Math.min(totalBytesSaved / totalDepsSize, 1);
  return Math.max(0, Math.round(100 - wasteRatio * 100));
}

export function buildScanResult(
  targetDir: string,
  filesScanned: number,
  imports: ImportRecord[],
  matches: Match[],
  scanDurationMs: number
): ScanResult {
  const totalBytesSaved = matches.reduce((sum, m) => {
    const maxSaving = Math.max(...m.functionEntry.alternatives.map((a) => a.bytesSaved));
    return sum + maxSaving;
  }, 0);

  const totalDepsSize = getTotalDepsSize(targetDir);
  const refactorScore = computeScore(totalBytesSaved, totalDepsSize);
  const grade = getScoreGrade(refactorScore);

  return {
    targetDir,
    filesScanned,
    imports,
    matches,
    totalBytesSaved,
    totalDepsSize,
    refactorScore,
    grade,
    scanDurationMs,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}
