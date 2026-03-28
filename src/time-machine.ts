import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { HistoryEntry, ScanResult } from './types.js';

const HISTORY_FILE = '.backend-diet-history.json';

function loadHistory(cwd: string): HistoryEntry[] {
  const histPath = path.join(cwd, HISTORY_FILE);
  try {
    const raw = fs.readFileSync(histPath, 'utf-8');
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(cwd: string, history: HistoryEntry[]): void {
  const histPath = path.join(cwd, HISTORY_FILE);
  try {
    fs.writeFileSync(histPath, JSON.stringify(history, null, 2), 'utf-8');
  } catch {
    // Fail silently — history is a nice-to-have
  }
}

function getCurrentGitRef(cwd: string): string | undefined {
  try {
    return execSync('git rev-parse --short HEAD', { cwd, stdio: ['pipe', 'pipe', 'pipe'] })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
}

export function recordScanResult(result: ScanResult, cwd: string): void {
  const history = loadHistory(cwd);
  const gitRef = getCurrentGitRef(cwd);

  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    gitRef,
    score: result.refactorScore,
    grade: result.grade,
    totalBytesSaved: result.totalBytesSaved,
  };

  // Keep last 50 entries
  history.push(entry);
  if (history.length > 50) history.splice(0, history.length - 50);

  saveHistory(cwd, history);
}

export function getHistory(cwd: string): HistoryEntry[] {
  return loadHistory(cwd);
}

export function analyzeTimeMachineTrend(
  history: HistoryEntry[],
  currentScore: number
): {
  isImproving: boolean;
  delta: number;
  sparkValues: number[];
} {
  const allScores = [...history.map((h) => h.score), currentScore];
  const delta = allScores.length > 1
    ? allScores[allScores.length - 1] - allScores[0]
    : 0;

  return {
    isImproving: delta >= 0,
    delta,
    sparkValues: allScores,
  };
}
