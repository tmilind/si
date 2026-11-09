import { existsSync, readdirSync, readFileSync } from 'node:fs';

/** Directory names under dist/<kind>/ that contain an index.html. */
export function listEntryDirs(kind: 'notes' | 'posts'): string[] {
  const root = `dist/${kind}`;
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(`${root}/${d.name}/index.html`))
    .map((d) => d.name)
    .sort();
}

export function readDist(path: string): string {
  return readFileSync(`dist/${path}`, 'utf8');
}
