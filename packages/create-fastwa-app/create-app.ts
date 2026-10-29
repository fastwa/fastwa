import {
  accessSync,
  constants,
  cpSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync
} from 'fs';
import { basename, dirname, join, resolve } from 'path';

import {
  PackageManager,
  cyan,
  getRunCommand,
  green,
  install,
  isFolderEmpty,
  tryGitInit
} from './helpers';

export interface CreateAppOptions {
  appPath: string;
  packageManager: PackageManager;
  skipInstall: boolean;
  disableGit: boolean;
}

const BAILEYS_VERSION = '7.0.0-rc14';

function getVersion(): string {
  const pkg = readFileSync(join(__dirname, 'package.json'), 'utf8');
  return JSON.parse(pkg).version;
}

function createPackageJson(appName: string) {
  const fastwa = `^${getVersion()}`;

  return {
    name: appName,
    version: '0.1.0',
    private: true,
    type: 'module',
    engines: {
      node: '>=20.19.0'
    },
    scripts: {
      build: 'tsc',
      start: 'node dist/main.js',
      dev: 'tsc && node dist/main.js'
    },
    dependencies: {
      '@fastwa/client': fastwa,
      '@fastwa/common': fastwa,
      '@fastwa/core': fastwa,
      '@whiskeysockets/baileys': BAILEYS_VERSION,
      'class-transformer': '^0.5.1',
      'class-validator': '^0.15.1',
      'qrcode-terminal': '^0.12.0',
      'reflect-metadata': '^0.2.2'
    },
    devDependencies: {
      '@types/node': '^22.0.0',
      '@types/qrcode-terminal': '^0.12.2',
      typescript: '^5.9.3'
    }
  };
}

function isWriteable(directory: string) {
  try {
    accessSync(directory, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export async function createApp({
  appPath,
  packageManager,
  skipInstall,
  disableGit
}: CreateAppOptions) {
  const root = resolve(appPath);
  const appName = basename(root);

  if (!isWriteable(dirname(root))) {
    throw new Error(
      'The application path is not writable, please check folder permissions and try again.'
    );
  }

  mkdirSync(root, { recursive: true });

  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  console.log(`Creating a new Fastwa app in ${green(root)}.`);
  console.log();

  cpSync(join(__dirname, 'templates', 'default'), root, { recursive: true });

  // npm renames .gitignore to .npmignore when publishing, so it ships without the dot
  renameSync(join(root, 'gitignore'), join(root, '.gitignore'));

  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify(createPackageJson(appName), null, 2) + '\n'
  );

  if (!skipInstall) {
    console.log('Installing dependencies:');
    console.log();

    await install(root, packageManager);
    console.log();
  }

  if (!disableGit && tryGitInit(root)) {
    console.log('Initialized a git repository.');
    console.log();
  }

  const cdPath = appPath === '.' ? null : appPath;

  console.log(`${green('Success!')} Created ${appName} at ${root}`);
  console.log();
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(cyan(`  ${getRunCommand(packageManager, 'dev')}`));
  console.log('    Builds and starts the bot.');
  console.log();
  console.log(cyan(`  ${getRunCommand(packageManager, 'build')}`));
  console.log('    Compiles the app to dist/.');
  console.log();
  console.log(cyan(`  ${getRunCommand(packageManager, 'start')}`));
  console.log('    Starts the compiled bot.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();

  if (cdPath) {
    console.log(cyan('  cd'), cdPath);
  }

  if (skipInstall) {
    console.log(cyan(`  ${packageManager} install`));
  }

  console.log(cyan(`  ${getRunCommand(packageManager, 'dev')}`));
  console.log();
}
