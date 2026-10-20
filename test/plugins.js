import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as esbuild from 'esbuild';
import { build as rolldownBuild } from 'rolldown';
import { build as viteBuild, createServer } from 'vite';
import * as plugins from '../src/plugins.js';

const CORE = join(import.meta.dirname, '../src/$index.js');
const PAGE = '{{#expect name}}<p>Hello, {{ name }}!</p>';

async function fixture(page = PAGE) {
	let dir = await realpath(await mkdtemp(join(tmpdir(), 'tempura-')));
	await writeFile(join(dir, 'page.hbs'), page);
	await writeFile(join(dir, 'entry.js'), `import page from './page.hbs';\nexport default page;\n`);
	return dir;
}

async function load(file) {
	return (await import(file + '?t=' + Date.now())).default;
}

// ---

const options = suite('options');

options('should throw on a `values` that is not a function', () => {
	assert.throws(() => plugins.esbuild.compile({ values: {} }), /options\.values/);
	assert.throws(() => plugins.rolldown.compile({ values: {} }), /options\.values/);
	assert.throws(() => plugins.vite.compile({ values: {} }), /options\.values/);
});

options('should throw on a `minify` that is not a function', () => {
	assert.throws(() => plugins.esbuild.compile({ minify: true }), /options\.minify/);
	assert.throws(() => plugins.rolldown.compile({ minify: true }), /options\.minify/);
});

options.run();

// ---

const build = suite('esbuild');

async function bundle(dir, plugin) {
	let outfile = join(dir, 'out.mjs');
	await esbuild.build({
		entryPoints: [join(dir, 'entry.js')],
		alias: { tempura: CORE },
		bundle: true,
		format: 'esm',
		logLevel: 'silent',
		plugins: [plugin],
		outfile,
	});
	return load(outfile);
}

build('transform :: loads a template as its render function', async () => {
	let dir = await fixture();
	try {
		let render = await bundle(dir, plugins.esbuild.transform());
		assert.is(render({ name: '<b>' }), '<p>Hello, &lt;b>!</p>');
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

build('compile :: loads a template as its HTML, from `values`, then `minify`', async () => {
	let dir = await fixture();
	try {
		let file;
		let html = await bundle(dir, plugins.esbuild.compile({
			values: path => (file = path, { name: 'Luke' }),
			minify: text => text.toUpperCase(),
		}));
		assert.is(html, '<P>HELLO, LUKE!</P>');
		assert.is(file, join(dir, 'page.hbs'));
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

build('transform :: fails the build on a template error', async () => {
	let dir = await fixture('{{#if x}}open');
	try {
		await bundle(dir, plugins.esbuild.transform());
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.match(err.message, 'Unterminated "if" block');
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

build('tree-shakes everything but `esc` from a transformed template', async () => {
	let dir = await fixture();
	try {
		let { outputFiles } = await esbuild.build({
			entryPoints: [join(dir, 'entry.js')],
			alias: { tempura: CORE },
			bundle: true,
			format: 'esm',
			write: false,
			plugins: [plugins.esbuild.transform()],
		});
		let code = outputFiles[0].text;
		assert.match(code, 'function esc(');
		assert.not.match(code, 'yield');
		assert.not.match(code, 'function gen(');
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

build.run();

// ---

const roll = suite('rolldown');

async function rolldown(dir, plugin) {
	let file = join(dir, 'out.mjs');
	await rolldownBuild({
		input: join(dir, 'entry.js'),
		resolve: { alias: { tempura: CORE } },
		plugins: [plugin],
		logLevel: 'silent',
		output: { file, format: 'esm' },
	});
	return load(file);
}

roll('transform :: loads a template as its render function', async () => {
	let dir = await fixture();
	try {
		let render = await rolldown(dir, plugins.rolldown.transform());
		assert.is(render({ name: '<b>' }), '<p>Hello, &lt;b>!</p>');
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

roll('compile :: loads a template as its HTML, from `values`, then `minify`', async () => {
	let dir = await fixture();
	try {
		let file;
		let html = await rolldown(dir, plugins.rolldown.compile({
			values: path => (file = path, { name: 'Luke' }),
			minify: text => text.toUpperCase(),
		}));
		assert.is(html, '<P>HELLO, LUKE!</P>');
		assert.is(file, join(dir, 'page.hbs'));
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

roll('transform :: fails the build on a template error', async () => {
	let dir = await fixture('{{#if x}}open');
	try {
		await rolldown(dir, plugins.rolldown.transform());
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.match(err.message, 'Unterminated "if" block');
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

roll.run();

// ---

const vite = suite('vite');

async function vitest(dir, plugin) {
	await viteBuild({
		root: dir,
		configFile: false,
		logLevel: 'silent',
		resolve: { alias: { tempura: CORE } },
		plugins: [plugin],
		build: {
			outDir: join(dir, 'dist'),
			minify: false,
			lib: { entry: join(dir, 'entry.js'), formats: ['es'], fileName: () => 'out.js' },
		},
	});
	return load(join(dir, 'dist/out.js'));
}

vite('runs before the vite transforms', () => {
	assert.is(plugins.vite.transform().enforce, 'pre');
	assert.is(plugins.vite.compile().enforce, 'pre');
});

vite('transform :: loads a template as its render function', async () => {
	let dir = await fixture();
	try {
		let render = await vitest(dir, plugins.vite.transform());
		assert.is(render({ name: '<b>' }), '<p>Hello, &lt;b>!</p>');
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

vite('compile :: loads a template as its HTML, from `values`, then `minify`', async () => {
	let dir = await fixture();
	try {
		let file;
		let html = await vitest(dir, plugins.vite.compile({
			values: path => (file = path, { name: 'Luke' }),
			minify: text => text.toUpperCase(),
		}));
		assert.is(html, '<P>HELLO, LUKE!</P>');
		assert.is(file, join(dir, 'page.hbs'));
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});

vite('transform :: serves a template as a module in dev', async () => {
	let dir = await fixture();
	let server = await createServer({
		root: dir,
		configFile: false,
		logLevel: 'silent',
		resolve: { alias: { tempura: CORE } },
		server: { middlewareMode: true, ws: false },
		plugins: [plugins.vite.transform()],
	});
	try {
		let result = await server.transformRequest('/page.hbs');
		assert.match(result.code, 'export default function($$3,$$2)');
		assert.match(result.code, '$index.js');
	} finally {
		await server.close();
		await rm(dir, { recursive: true, force: true });
	}
});

vite.run();
