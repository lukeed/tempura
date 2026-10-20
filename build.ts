import { copyFile, mkdir, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = import.meta.dirname;
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

let bundle = await Bun.build({
	entrypoints: [join(SRC, 'index.ts')],
	outdir: DIST,
	format: 'esm',
	target: 'browser',
});

if (!bundle.success) {
	throw new AggregateError(bundle.logs, 'Failed to bundle "src/index.ts"');
}

let transpiler = new Bun.Transpiler({ loader: 'ts' });
let plugins = await Bun.file(join(SRC, 'plugins.ts')).text();
await Bun.write(join(DIST, 'plugins.js'), transpiler.transformSync(plugins));

await copyFile(join(SRC, 'types/index.d.ts'), join(DIST, 'index.d.ts'));
await copyFile(join(SRC, 'types/plugins.d.ts'), join(DIST, 'plugins.d.ts'));

function size(bytes: number): string {
	return bytes < 1e3 ? `${bytes} B` : `${(bytes / 1e3).toFixed(2)} kB`;
}

async function minified(file: string): Promise<Uint8Array> {
	let result = await Bun.build({ entrypoints: [file], format: 'esm', target: 'browser', external: ['*'], minify: true });
	if (!result.success) throw new AggregateError(result.logs, `Failed to minify "${relative(ROOT, file)}"`);
	return new Uint8Array(await result.outputs[0].arrayBuffer());
}

console.log('%s %s %s %s', 'file'.padEnd(18), 'size'.padStart(9), 'min'.padStart(9), 'min+gzip'.padStart(9));
for (let name of ['index.js', 'plugins.js', 'index.d.ts', 'plugins.d.ts']) {
	let file = join(DIST, name);
	let bytes = await Bun.file(file).bytes();
	let min = name.endsWith('.js') ? await minified(file) : undefined;
	console.log('%s %s %s %s', relative(ROOT, file).padEnd(18), size(bytes.length).padStart(9), (min ? size(min.length) : '').padStart(9), (min ? size(gzipSync(min).length) : '').padStart(9));
}
