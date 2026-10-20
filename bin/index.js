import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const src = join(import.meta.dirname, '../src');

let [$utils, $index] = await Promise.all([
	readFile(join(src, '$utils.js'), 'utf8'),
	readFile(join(src, '$index.js'), 'utf8'),
]);

$utils = $utils.replace('export function', 'function').replace(/\$/g, '\0');
$index = $index.replace(/^import.*(?:\n)/m, $utils).replace(/\0/g, '$$');

console.log('~> creating "src/index.js" placeholder');
await writeFile(join(src, 'index.js'), $index);
