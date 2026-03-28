import type { ScanResult } from '../types.js';

export interface JsonReport {
  version: string;
  timestamp: string;
  targetDir: string;
  summary: {
    filesScanned: number;
    matchesFound: number;
    uniquePackages: string[];
    totalBytesSaved: number;
    totalBytesSavedFormatted: string;
    refactorScore: number;
    grade: string;
    scanDurationMs: number;
  };
  matches: Array<{
    file: string;
    line: number;
    packageName: string;
    functionName: string;
    raw: string;
    alternatives: Array<{
      api: string;
      minNodeVersion: string;
      bytesSaved: number;
      difficulty: string;
      snippet: { before: string; after: string };
      docsUrl?: string;
    }>;
  }>;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function buildJsonReport(result: ScanResult): JsonReport {
  const uniquePackages = [...new Set(result.matches.map((m) => m.packageEntry.packageName))];

  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    targetDir: result.targetDir,
    summary: {
      filesScanned: result.filesScanned,
      matchesFound: result.matches.length,
      uniquePackages,
      totalBytesSaved: result.totalBytesSaved,
      totalBytesSavedFormatted: formatBytes(result.totalBytesSaved),
      refactorScore: result.refactorScore,
      grade: result.grade,
      scanDurationMs: result.scanDurationMs,
    },
    matches: result.matches.map((m) => ({
      file: m.importRecord.file,
      line: m.importRecord.line,
      packageName: m.importRecord.packageName,
      functionName: m.importRecord.functionName,
      raw: m.importRecord.raw,
      alternatives: m.functionEntry.alternatives.map((a) => ({
        api: a.api,
        minNodeVersion: a.minNodeVersion,
        bytesSaved: a.bytesSaved,
        difficulty: a.difficulty,
        snippet: a.snippet,
        ...(a.docsUrl ? { docsUrl: a.docsUrl } : {}),
      })),
    })),
  };
}

export function printJsonReport(result: ScanResult): void {
  const report = buildJsonReport(result);
  console.log(JSON.stringify(report, null, 2));
}
