import { readdirSync } from 'fs';

import { green } from './colors';

// Files that may exist before the app is created, e.g. from `git init`
const ALLOWED_FILES = new Set([
  '.DS_Store',
  '.git',
  '.gitattributes',
  '.gitignore',
  '.idea',
  '.npmignore',
  '.vscode',
  'LICENSE',
  'Thumbs.db',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log'
]);

export function isFolderEmpty(root: string, name: string) {
  const conflicts = readdirSync(root).filter(
    (file) => !ALLOWED_FILES.has(file) && !file.endsWith('.iml')
  );

  if (conflicts.length === 0) {
    return true;
  }

  console.log(
    `The directory ${green(name)} contains files that could conflict:`
  );
  console.log();
  conflicts.forEach((file) => console.log(`  ${file}`));
  console.log();
  console.log(
    `Either try using a new directory name, or remove the files listed above.`
  );

  return false;
}
