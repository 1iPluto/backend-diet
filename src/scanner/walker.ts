import fg from 'fast-glob';
import path from 'path';

const SOURCE_EXTENSIONS = ['js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs'];

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.nuxt/**',
  '**/coverage/**',
  '**/*.min.js',
  '**/*.bundle.js',
];

export async function walkFiles(
  targetDir: string,
  extraIgnore: string[] = []
): Promise<string[]> {
  const pattern = `**/*.{${SOURCE_EXTENSIONS.join(',')}}`;
  const ignore = [...DEFAULT_IGNORE, ...extraIgnore];

  const files = await fg(pattern, {
    cwd: path.resolve(targetDir),
    absolute: true,
    ignore,
    followSymbolicLinks: false,
    onlyFiles: true,
  });

  return files.sort();
}
