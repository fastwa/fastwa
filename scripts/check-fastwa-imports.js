// Fails when the platform-independent fastwa package imports a platform
// library: platform code belongs in its adapter package (e.g. @fastwa/baileys)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'packages', 'fastwa');
const forbidden = ['@whiskeysockets/baileys', '@fastwa/'];
const imports = /(?:from|require\(|import\()\s*['"]([^'"]+)['"]/g;

const violations = [];

for (const file of fs.readdirSync(root, { recursive: true })) {
  if (
    file.split(path.sep).includes('node_modules') ||
    !file.endsWith('.ts') ||
    file.endsWith('.d.ts')
  ) {
    continue;
  }

  const source = fs.readFileSync(path.join(root, file), 'utf8');

  for (const [, specifier] of source.matchAll(imports)) {
    if (forbidden.some((name) => specifier.startsWith(name))) {
      violations.push(`packages/fastwa/${file}: ${specifier}`);
    }
  }
}

if (violations.length) {
  console.error('fastwa must not import platform packages:');
  violations.forEach((violation) => console.error(`  ${violation}`));
  process.exit(1);
}
