export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/**
 * Detects the package manager that ran the CLI (e.g. `pnpm create fastwa-app`)
 */
export function getPkgManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.startsWith('pnpm')) {
    return 'pnpm';
  }

  if (userAgent.startsWith('yarn')) {
    return 'yarn';
  }

  if (userAgent.startsWith('bun')) {
    return 'bun';
  }

  return 'npm';
}

export function getRunCommand(packageManager: PackageManager, script: string) {
  return packageManager === 'npm'
    ? `npm run ${script}`
    : `${packageManager} ${script}`;
}
