export type Difficulty = 'trivial' | 'easy' | 'moderate' | 'hard';

export type ScoreGrade = 'CRITICAL' | 'NEEDS WORK' | 'HEALTHY' | 'SVELTE';

export interface CodeSnippet {
  before: string;
  after: string;
}

export interface NativeAlternative {
  /** e.g. "structuredClone", "Array.prototype.flat" */
  api: string;
  /** Minimum Node.js version required, e.g. "18.0.0" */
  minNodeVersion: string;
  /** Approximate minified+gzipped bytes saved by eliminating this function's weight */
  bytesSaved: number;
  snippet: CodeSnippet;
  difficulty: Difficulty;
  docsUrl?: string;
}

export interface FunctionEntry {
  /** The imported function name, e.g. "cloneDeep" */
  name: string;
  /** Alternative sub-path imports, e.g. "lodash/cloneDeep" */
  importPaths?: string[];
  alternatives: NativeAlternative[];
}

export interface PackageEntry {
  packageName: string;
  description: string;
  /** Total package gzipped size in bytes */
  gzippedSize: number;
  functions: FunctionEntry[];
  /** True if the entire package can be replaced with natives */
  canFullyReplace: boolean;
}

export interface ImportRecord {
  /** Absolute path to the source file */
  file: string;
  /** The npm package being imported, e.g. "lodash" */
  packageName: string;
  /** The specific function/specifier, e.g. "cloneDeep" */
  functionName: string;
  line: number;
  col: number;
  /** The raw import statement for display */
  raw: string;
}

export interface Match {
  importRecord: ImportRecord;
  packageEntry: PackageEntry;
  functionEntry: FunctionEntry;
}

export interface ScanResult {
  /** The directory that was scanned */
  targetDir: string;
  /** Total files scanned */
  filesScanned: number;
  /** All raw import records found */
  imports: ImportRecord[];
  /** All matched imports that have known alternatives */
  matches: Match[];
  /** Total bytes that could be saved */
  totalBytesSaved: number;
  /** Total bytes of all direct dependencies (from package.json) */
  totalDepsSize: number;
  /** 0–100 score */
  refactorScore: number;
  grade: ScoreGrade;
  scanDurationMs: number;
}

export interface ScanOptions {
  targetDir: string;
  ignore: string[];
  fix: boolean;
  applyFix: boolean;
  badge: boolean;
  since?: string;
  format: 'terminal' | 'json';
}

export interface PatchResult {
  file: string;
  originalLine: number;
  before: string;
  after: string;
  applied: boolean;
}

export interface HistoryEntry {
  timestamp: string;
  gitRef?: string;
  score: number;
  grade: ScoreGrade;
  totalBytesSaved: number;
}
