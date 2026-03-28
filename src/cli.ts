import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import chalk from 'chalk';
import { walkFiles } from './scanner/walker.js';
import { parseFiles } from './scanner/parser.js';
import { matchImports } from './database/index.js';
import { buildScanResult } from './scorer.js';
import {
  printHeader,
  printScoreCard,
  printMatchesTable,
  printSuggestions,
  printFooter,
  printError,
  printInfo,
  printTimeMachine,
  printPatchPreview,
} from './reporter/terminal.js';
import { printJsonReport } from './reporter/json.js';
import { computePatches, applyPatches } from './patcher.js';
import { printBadge } from './badger.js';
import { recordScanResult, getHistory, analyzeTimeMachineTrend } from './time-machine.js';

const VERSION = '1.0.0';

interface ScanOptions {
  fix?: boolean;
  yes?: boolean;
  badge?: boolean;
  since?: string;
  format: string;
  ignore?: string[];
  noHeader?: boolean;
}

async function runScan(directory: string | undefined, options: ScanOptions): Promise<void> {
  const targetDir = path.resolve(directory ?? process.cwd());
  const isJson = options.format === 'json';

  if (!isJson && !options.noHeader) {
    printHeader();
  }

  const spinner = isJson ? null : ora({ text: 'Scanning files…', color: 'cyan' }).start();

  try {
    const startMs = Date.now();

    // 1. Walk files
    const files = await walkFiles(targetDir, options.ignore ?? []);

    if (spinner) spinner.text = `Parsing ${files.length} files…`;

    // 2. Parse AST
    const imports = await parseFiles(files);

    if (spinner) spinner.text = 'Matching against diet database…';

    // 3. Match against database
    const matches = matchImports(imports);

    const scanDurationMs = Date.now() - startMs;

    // 4. Build result
    const result = buildScanResult(targetDir, files.length, imports, matches, scanDurationMs);

    if (spinner) spinner.succeed(chalk.green(`Scanned ${files.length} files in ${scanDurationMs}ms`));

    // 5. Record to history
    recordScanResult(result, targetDir);

    // 6. Output
    if (isJson) {
      printJsonReport(result);
      return;
    }

    printScoreCard(result);
    printMatchesTable(matches);

    if (matches.length > 0) {
      printSuggestions(matches);
    }

    // 7. Time Machine
    if (options.since) {
      printInfo('Time Machine: comparing score trend…');
      const history = getHistory(targetDir);
      analyzeTimeMachineTrend(history, result.refactorScore);

      printTimeMachine(
        history.map((h) => ({
          timestamp: h.timestamp,
          score: h.score,
          gitRef: h.gitRef,
          grade: h.grade,
        })),
        result.refactorScore
      );
    }

    // 8. Badge
    if (options.badge) {
      printBadge(result.refactorScore, result.grade);
    }

    // 9. Auto-patch
    if (options.fix) {
      const patches = computePatches(matches, targetDir);

      if (patches.length === 0) {
        printInfo('No trivial patches available for automatic rewriting.');
      } else {
        console.log(
          chalk.bold.white(
            `\n  AUTO-PATCH PREVIEW  (${patches.length} trivial replacement${patches.length === 1 ? '' : 's'})\n`
          )
        );

        for (const patch of patches) {
          printPatchPreview(patch.file, patch.before, patch.after);
        }

        if (options.yes) {
          const applied = applyPatches(patches, targetDir);
          console.log(
            chalk.green(`\n  ✓ Applied ${applied.length} patch${applied.length === 1 ? '' : 'es'} successfully.\n`)
          );
        } else {
          console.log(chalk.dim('  Add --yes to apply these patches in-place.\n'));
        }
      }
    }

    printFooter(result, !!options.fix && !options.yes);

    // Exit with non-zero code if score is CRITICAL (useful for CI)
    if (result.grade === 'CRITICAL') {
      process.exit(1);
    }
  } catch (err) {
    if (spinner) spinner.fail('Scan failed');
    printError(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// ─── CLI Definition ───────────────────────────────────────────────────────────
const program = new Command();

program
  .name('backend-diet')
  .version(VERSION, '-v, --version')
  .description('Put your project on a diet. Find heavy packages, get native alternatives.')
  .helpOption('-h, --help', 'Display help');

program
  .command('scan [directory]', { isDefault: true })
  .description('Scan source files for heavy library usage and suggest native alternatives')
  .option('--fix', 'Preview trivial auto-patches (dry run by default)')
  .option('--yes', 'Apply --fix patches in-place (requires --fix)')
  .option('--badge', 'Print a Shields.io badge for your README')
  .option('--since <ref>', 'Show score trend since a git ref (e.g. HEAD~10)')
  .option('--format <fmt>', 'Output format: terminal | json', 'terminal')
  .option('--ignore <patterns...>', 'Glob patterns to ignore (e.g. "vendor/**")')
  .option('--no-header', 'Suppress the ASCII art header')
  .action(async (directory: string | undefined, options: {
    fix?: boolean;
    yes?: boolean;
    badge?: boolean;
    since?: string;
    format: string;
    ignore?: string[];
    header: boolean;
  }) => {
    await runScan(directory, {
      ...options,
      noHeader: !options.header,
    });
  });

program.parse(process.argv);
