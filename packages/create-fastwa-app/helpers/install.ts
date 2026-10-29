import { spawn } from 'child_process';

import { PackageManager } from './get-pkg-manager';

export function install(root: string, packageManager: PackageManager) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(packageManager, ['install'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        ADBLOCK: '1',
        DISABLE_OPENCOLLECTIVE: '1'
      }
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(
          new Error(`${packageManager} install exited with ${code}`)
        );
      }

      resolve();
    });
  });
}
