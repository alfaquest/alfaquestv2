import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');

const files = [
  'index.html',
  'alfaquest.html',
  'alfafilleasy.html',
  'alfafillnormal.html',
  'alfafillhard.html',
  'helpv2.html',
  'aqvai.html',
  'allletters-game.js',
  'scripts/runtime-config.js',
  'scripts/starfield-bg.js',
  '_headers'
];

const directories = ['css', 'images', 'shared'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  await mkdir(dirname(join(output, file)), { recursive: true });
  await cp(join(root, file), join(output, file));
}

for (const directory of directories) {
  await cp(join(root, directory), join(output, directory), { recursive: true });
}

console.log(`Static site built at ${output}`);
