import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const publicDir = path.join(repoRoot, 'public');

const itemsToCopy = [
  'index.html',
  'doctors.html',
  'Dashboard.html',
  'LAB-DASH.html',
  'Pharmacy.html',
  'Total.html',
  'login.html',
  'loginp.html',
  'Emergency.html',
  'Dashboard',
  'Services',
  'videos',
  'img',
  'JavaScript-Files'
];

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function copyRecursive(src, dest) {
  const s = await stat(src);
  if (s.isDirectory()) {
    await ensureDir(dest);
    const entries = await readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else if (s.isFile()) {
    await ensureDir(path.dirname(dest));
    await copyFile(src, dest);
  }
}

async function main() {
  await ensureDir(publicDir);
  for (const item of itemsToCopy) {
    const src = path.join(repoRoot, item);
    const dest = path.join(publicDir, item);
    try {
      await copyRecursive(src, dest);
      console.log('Copied', item);
    } catch (err) {
      console.warn('Skipping', item, '-', err.message);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
