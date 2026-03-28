import type { ScoreGrade } from './types.js';

const BADGE_COLORS: Record<ScoreGrade, string> = {
  CRITICAL: 'red',
  'NEEDS WORK': 'yellow',
  HEALTHY: 'green',
  SVELTE: 'brightgreen',
};

/**
 * Generates a Shields.io badge URL for the given score.
 * Output is markdown-ready for pasting into README.md.
 */
export function generateBadge(score: number, grade: ScoreGrade): string {
  const color = BADGE_COLORS[grade];
  const label = encodeURIComponent('backend-diet');
  const message = encodeURIComponent(`${score}% lean`);
  const badgeUrl = `https://img.shields.io/badge/${label}-${message}-${color}?style=flat-square&logo=npm`;

  return `[![backend-diet score](${badgeUrl})](https://github.com/1iPluto/backend-diet)`;
}

/**
 * Prints the badge markdown and instructions to stdout.
 */
export function printBadge(score: number, grade: ScoreGrade): void {
  const badge = generateBadge(score, grade);
  console.log('\n  Paste this into your README.md:\n');
  console.log(`  ${badge}`);
  console.log();
}
