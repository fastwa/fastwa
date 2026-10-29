// Removes every build output from packages/, including files left behind by
// sources that no longer exist, which `tsc -b --clean` does not track
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'packages');
const outputs = /\.(js|d\.ts|tsbuildinfo)$/;

for (const file of fs.readdirSync(root, { recursive: true })) {
  if (file.split(path.sep).includes('node_modules') || !outputs.test(file)) {
    continue;
  }

  fs.rmSync(path.join(root, file));
}
