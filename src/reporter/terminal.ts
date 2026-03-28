import chalk, { type ChalkInstance } from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';
import gradient from 'gradient-string';
import type { ScanResult, Match, ScoreGrade, NativeAlternative, Difficulty } from '../types.js';
import { formatBytes } from '../scorer.js';

// ─── Colour palette ──────────────────────────────────────────────────────────
const BRAND = gradient(['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF']);

const gradeColor: Record<ScoreGrade, ChalkInstance> = {
  CRITICAL: chalk.red.bold,
  'NEEDS WORK': chalk.yellow.bold,
  HEALTHY: chalk.green.bold,
  SVELTE: chalk.cyan.bold,
};

const gradeIcon: Record<ScoreGrade, string> = {
  CRITICAL: '💀',
  'NEEDS WORK': '⚠️ ',
  HEALTHY: '✅',
  SVELTE: '🥗',
};

const difficultyColor: Record<Difficulty, ChalkInstance> = {
  trivial: chalk.green,
  easy: chalk.cyan,
  moderate: chalk.yellow,
  hard: chalk.red,
};

const difficultyLabel: Record<Difficulty, string> = {
  trivial: 'TRIVIAL',
  easy: 'EASY',
  moderate: 'MODERATE',
  hard: 'HARD',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function scoreBar(score: number): string {
  const filled = Math.round(score / 5);
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  if (score >= 90) return chalk.cyan(bar);
  if (score >= 70) return chalk.green(bar);
  if (score >= 40) return chalk.yellow(bar);
  return chalk.red(bar);
}

function sparkline(values: number[]): string {
  const BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v) => {
      const idx = Math.round(((v - min) / range) * (BLOCKS.length - 1));
      return BLOCKS[idx];
    })
    .join('');
}

function formatDiff(before: string, after: string): string {
  const beforeLines = before.split('\n').map((l) => chalk.red(`- ${l}`));
  const afterLines = after.split('\n').map((l) => chalk.green(`+ ${l}`));
  return [...beforeLines, ...afterLines].join('\n');
}

function wrapSnippet(alternative: NativeAlternative): string {
  return [
    chalk.dim('  ┌── Before ──────────────────────────────'),
    ...alternative.snippet.before.split('\n').map((l) => chalk.red(`  │  ${l}`)),
    chalk.dim('  ├── After ───────────────────────────────'),
    ...alternative.snippet.after.split('\n').map((l) => chalk.green(`  │  ${l}`)),
    chalk.dim('  └────────────────────────────────────────'),
  ].join('\n');
}

// ─── Header ──────────────────────────────────────────────────────────────────
export function printHeader(): void {
  const title = BRAND(
    '  ██████╗ ██╗  ██╗ ██████╗       ██████╗ ██╗███████╗████████╗\n' +
    '  ██╔══██╗██║ ██╔╝██╔════╝       ██╔══██╗██║██╔════╝╚══██╔══╝\n' +
    '  ██████╔╝█████╔╝ ██║  ███╗█████╗██║  ██║██║█████╗     ██║   \n' +
    '  ██╔═══╝ ██╔═██╗ ██║   ██║╚════╝██║  ██║██║██╔══╝     ██║   \n' +
    '  ██║     ██║  ██╗╚██████╔╝      ██████╔╝██║███████╗   ██║   \n' +
    '  ╚═╝     ╚═╝  ╚═╝ ╚═════╝       ╚═════╝ ╚═╝╚══════╝   ╚═╝   '
  );

  console.log(
    boxen(title, {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'magenta',
    })
  );
  console.log(
    chalk.dim('  Put your project on a diet. Find heavy packages, go native.\n')
  );
}

// ─── Score card ──────────────────────────────────────────────────────────────
export function printScoreCard(result: ScanResult): void {
  const { refactorScore, grade, totalBytesSaved, filesScanned, matches, scanDurationMs } = result;

  const uniquePackages = new Set(matches.map((m) => m.packageEntry.packageName));
  const colorFn = gradeColor[grade];
  const icon = gradeIcon[grade];

  const content = [
    '',
    `  ${BRAND('REFACTOR SCORE')}`,
    '',
    `  ${scoreBar(refactorScore)}  ${colorFn(`${refactorScore}/100`)}`,
    '',
    `  Grade: ${colorFn(`${icon} ${grade}`)}`,
    '',
    `  ${chalk.dim('─'.repeat(44))}`,
    '',
    `  ${chalk.white('Potential savings:')}   ${chalk.yellow.bold(formatBytes(totalBytesSaved))}`,
    `  ${chalk.white('Packages to replace:')} ${chalk.yellow.bold(String(uniquePackages.size))}`,
    `  ${chalk.white('Usage sites found:')}   ${chalk.yellow.bold(String(matches.length))}`,
    `  ${chalk.white('Files scanned:')}       ${chalk.dim(String(filesScanned))}`,
    `  ${chalk.white('Scan duration:')}       ${chalk.dim(`${scanDurationMs}ms`)}`,
    '',
  ].join('\n');

  console.log(
    boxen(content, {
      borderStyle: 'double',
      borderColor: grade === 'CRITICAL' ? 'red' : grade === 'SVELTE' ? 'cyan' : 'yellow',
      padding: 0,
    })
  );
}

// ─── Matches table ────────────────────────────────────────────────────────────
export function printMatchesTable(matches: Match[]): void {
  if (matches.length === 0) {
    console.log(chalk.green('\n  ✓ No heavy library usage found. Your project is already lean!\n'));
    return;
  }

  console.log(chalk.bold.white('\n  DETECTED USAGE\n'));

  const table = new Table({
    head: [
      chalk.bold.cyan('Package'),
      chalk.bold.cyan('Function'),
      chalk.bold.cyan('File'),
      chalk.bold.cyan('Line'),
      chalk.bold.cyan('Savings'),
      chalk.bold.cyan('Effort'),
    ],
    style: { head: [], border: ['dim'] },
    colWidths: [16, 16, 36, 6, 12, 12],
    wordWrap: true,
  });

  for (const match of matches) {
    const best = match.functionEntry.alternatives[0];
    if (!best) continue;

    const diffColor = difficultyColor[best.difficulty];
    const shortFile = match.importRecord.file.length > 34
      ? '…' + match.importRecord.file.slice(-33)
      : match.importRecord.file;

    table.push([
      chalk.magenta(match.packageEntry.packageName),
      chalk.white(match.importRecord.functionName),
      chalk.dim(shortFile),
      chalk.dim(String(match.importRecord.line)),
      chalk.yellow(formatBytes(best.bytesSaved)),
      diffColor(difficultyLabel[best.difficulty]),
    ]);
  }

  console.log(table.toString());
}

// ─── Detailed suggestions ─────────────────────────────────────────────────────
export function printSuggestions(matches: Match[]): void {
  if (matches.length === 0) return;

  // Group by package
  const byPackage = new Map<string, Match[]>();
  for (const m of matches) {
    const key = m.packageEntry.packageName;
    if (!byPackage.has(key)) byPackage.set(key, []);
    byPackage.get(key)!.push(m);
  }

  console.log(chalk.bold.white('\n  NATIVE ALTERNATIVES\n'));

  for (const [packageName, pkgMatches] of byPackage) {
    const totalSavings = pkgMatches.reduce((sum, m) => {
      const best = m.functionEntry.alternatives[0];
      return sum + (best?.bytesSaved ?? 0);
    }, 0);

    console.log(
      boxen(
        `  ${chalk.bold.magenta(packageName)}   ${chalk.dim(`→ could save ${formatBytes(totalSavings)}`)}`,
        { padding: 0, borderStyle: 'single', borderColor: 'magenta' }
      )
    );
    console.log();

    // Deduplicate by function name within this package
    const seenFunctions = new Set<string>();
    for (const match of pkgMatches) {
      const fnName = match.functionEntry.name;
      if (seenFunctions.has(fnName)) continue;
      seenFunctions.add(fnName);

      const alt = match.functionEntry.alternatives[0];
      if (!alt) continue;

      const diffColor = difficultyColor[alt.difficulty];

      console.log(
        `  ${chalk.bold.white(fnName)}  ` +
        `${chalk.dim('→')}  ${chalk.cyan(alt.api)}  ` +
        `${chalk.dim('|')}  Node ≥ ${chalk.dim(alt.minNodeVersion)}  ` +
        `${chalk.dim('|')}  ${diffColor(difficultyLabel[alt.difficulty])}` +
        (alt.docsUrl ? `\n  ${chalk.dim.underline(alt.docsUrl)}` : '')
      );
      console.log();
      console.log(wrapSnippet(alt));
      console.log();
    }
  }
}

// ─── Time Machine ────────────────────────────────────────────────────────────
export function printTimeMachine(
  history: Array<{ timestamp: string; score: number; gitRef?: string; grade: string }>,
  currentScore: number
): void {
  if (history.length === 0) {
    console.log(chalk.dim('\n  No history yet — run again to build a trend.\n'));
    return;
  }

  const scores = [...history.map((h) => h.score), currentScore];
  const spark = sparkline(scores);
  const trend = scores[scores.length - 1] - scores[0];
  const trendStr = trend > 0
    ? chalk.green(`▲ +${trend} (leaner!)`)
    : trend < 0
    ? chalk.red(`▼ ${trend} (getting fatter!)`)
    : chalk.dim('━ no change');

  console.log(chalk.bold.white('\n  TIME MACHINE\n'));
  console.log(`  Score trend: ${chalk.cyan(spark)}  ${trendStr}`);
  console.log();

  const table = new Table({
    head: [chalk.bold.cyan('Date'), chalk.bold.cyan('Ref'), chalk.bold.cyan('Score'), chalk.bold.cyan('Grade')],
    style: { head: [], border: ['dim'] },
  });

  for (const entry of history.slice(-8)) {
    const color = gradeColor[entry.grade as ScoreGrade] ?? chalk.white;
    table.push([
      chalk.dim(new Date(entry.timestamp).toLocaleDateString()),
      chalk.dim(entry.gitRef ?? '—'),
      color(String(entry.score)),
      color(entry.grade as string),
    ]);
  }

  console.log(table.toString());
  console.log();
}

// ─── Summary footer ───────────────────────────────────────────────────────────
export function printFooter(_result: ScanResult, fixMode: boolean): void {
  const lines: string[] = [];

  if (fixMode) {
    lines.push(chalk.green('  ✦ Run with --fix --yes to auto-apply trivial patches.'));
  }

  lines.push(
    chalk.dim('  ✦ Add to CI:  ') + chalk.white('npx backend-diet scan --format json')
  );
  lines.push(
    chalk.dim('  ✦ Get badge:  ') + chalk.white('npx backend-diet scan --badge')
  );
  lines.push(
    chalk.dim('  ✦ Track trend:') + chalk.white(' npx backend-diet scan --since HEAD~10')
  );
  lines.push('');
  lines.push(
    chalk.dim('  Built by ') + chalk.white('Marwan Said') + chalk.dim(' · github.com/1iPluto/backend-diet')
  );

  console.log(
    boxen(lines.join('\n'), {
      borderStyle: 'round',
      borderColor: 'dim',
      padding: 0,
      margin: { top: 1, bottom: 0, left: 0, right: 0 },
    })
  );
}

// ─── Error / info printers ────────────────────────────────────────────────────
export function printError(msg: string): void {
  console.error(chalk.red(`\n  ✗ ${msg}\n`));
}

export function printInfo(msg: string): void {
  console.log(chalk.dim(`  ℹ  ${msg}`));
}

export function printPatchPreview(file: string, before: string, after: string): void {
  console.log(chalk.bold.white(`\n  📄 ${file}\n`));
  console.log(formatDiff(before, after));
  console.log();
}
