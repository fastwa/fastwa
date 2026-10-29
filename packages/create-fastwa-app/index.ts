#!/usr/bin/env node
import { createInterface } from 'readline/promises';
import { readFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { parseArgs } from 'util';

import { createApp } from './create-app';
import {
  PackageManager,
  bold,
  cyan,
  getPkgManager,
  green,
  red,
  validateNpmName
} from './helpers';

const DEFAULT_NAME = 'my-fastwa-app';

const HELP = `
Usage: ${cyan('create-fastwa-app')} ${green('[directory]')} [options]

Options:
  --use-npm         Bootstrap the application using npm
  --use-pnpm        Bootstrap the application using pnpm
  --use-yarn        Bootstrap the application using Yarn
  --use-bun         Bootstrap the application using Bun
  --skip-install    Skip installing dependencies
  --disable-git     Skip initializing a git repository
  -y, --yes         Use the defaults for any missing answer
  -v, --version     Output the current version
  -h, --help        Display this help message
`;

function getVersion(): string {
  const pkg = readFileSync(join(__dirname, 'package.json'), 'utf8');
  return JSON.parse(pkg).version;
}

function exitWithError(message: string): never {
  console.error(red(message));
  process.exit(1);
}

async function promptProjectName() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const answer = await rl.question(
      `${bold('What is your project named?')} (${DEFAULT_NAME}) `
    );
    return answer.trim() || DEFAULT_NAME;
  } finally {
    rl.close();
  }
}

function getPackageManager(values: Record<string, unknown>): PackageManager {
  if (values['use-npm']) return 'npm';
  if (values['use-pnpm']) return 'pnpm';
  if (values['use-yarn']) return 'yarn';
  if (values['use-bun']) return 'bun';

  return getPkgManager();
}

async function run() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'use-npm': { type: 'boolean' },
      'use-pnpm': { type: 'boolean' },
      'use-yarn': { type: 'boolean' },
      'use-bun': { type: 'boolean' },
      'skip-install': { type: 'boolean' },
      'disable-git': { type: 'boolean' },
      yes: { type: 'boolean', short: 'y' },
      version: { type: 'boolean', short: 'v' },
      help: { type: 'boolean', short: 'h' }
    }
  });

  if (values.help) {
    console.log(HELP);
    return;
  }

  if (values.version) {
    console.log(getVersion());
    return;
  }

  const interactive = process.stdin.isTTY && !values.yes;
  const appPath =
    positionals[0]?.trim() ||
    (interactive ? await promptProjectName() : DEFAULT_NAME);

  const { valid, problems } = validateNpmName(basename(resolve(appPath)));

  if (!valid) {
    exitWithError(
      [
        `Could not create a project called "${appPath}" because of npm naming restrictions:`,
        ...problems.map((problem) => `  * ${problem}`)
      ].join('\n')
    );
  }

  await createApp({
    appPath,
    packageManager: getPackageManager(values),
    skipInstall: !!values['skip-install'],
    disableGit: !!values['disable-git']
  });
}

run().catch((error) => exitWithError(error.message));
