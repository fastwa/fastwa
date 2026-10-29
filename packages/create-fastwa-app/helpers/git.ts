import { execSync } from 'child_process';
import { rmSync } from 'fs';
import { join } from 'path';

const run = (command: string, cwd: string) =>
  execSync(command, { cwd, stdio: 'ignore' });

function isInGitRepository(cwd: string) {
  try {
    run('git rev-parse --is-inside-work-tree', cwd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Initializes a repository with an initial commit
 *
 * @returns Whether the repository was created
 */
export function tryGitInit(root: string) {
  let initialized = false;

  try {
    run('git --version', root);

    if (isInGitRepository(root)) {
      return false;
    }

    run('git init', root);
    initialized = true;

    run('git checkout -b main', root);
    run('git add -A', root);
    run('git commit -m "Initial commit from Create Fastwa App"', root);

    return true;
  } catch {
    // e.g. git without user.name/user.email: leave no half-created repository
    if (initialized) {
      rmSync(join(root, '.git'), { recursive: true, force: true });
    }

    return false;
  }
}
