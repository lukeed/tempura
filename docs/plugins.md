# Plugins

`tempura/plugins` loads `.hbs` templates in a bundler: [esbuild](https://esbuild.github.io), [Rolldown](https://rolldown.rs), or [Vite](https://vite.dev).

```js
import { esbuild, rolldown, vite } from 'tempura/plugins';
```

Each bundler has two plugins:

- `transform()` loads each template as a module. Its default export is the render function, from [`tempura.transform`](/docs/api.md#tempuratransforminput-options). Your bundle renders the template when it runs.
- `compile()` renders each template at build time, from [`tempura.compile`](/docs/api.md#tempuracompileinput-options). The template loads as its HTML string, and your bundle holds no template code.

## esbuild

```js
import { build } from 'esbuild';
import { esbuild } from 'tempura/plugins';

await build({
	entryPoints: ['src/index.js'],
	bundle: true,
	outfile: 'dist/index.js',
	plugins: [esbuild.transform()],
});
```

## Rolldown

```js
// rolldown.config.js
import { defineConfig } from 'rolldown';
import { rolldown } from 'tempura/plugins';

export default defineConfig({
	input: 'src/index.js',
	output: { file: 'dist/index.js' },
	plugins: [rolldown.transform()],
});
```

## Vite

```js
// vite.config.js
import { defineConfig } from 'vite';
import { vite } from 'tempura/plugins';

export default defineConfig({
	plugins: [vite.transform()],
});
```

The Vite plugins run before the Vite transforms, in builds and in the dev server.

## Usage

With `transform()`, a template imports as its render function:

```js
import page from './page.hbs';

let html = page({ name: 'Luke' });
```

With `compile()`, a template imports as its HTML:

```js
import html from './page.hbs';
```

## Options

All common [Options](/docs/api.md#options-2) are supported, in addition to:

### options.filter
Type: `RegExp`<br>
Default: `/\.hbs$/`

The files to load as templates.

### options.values
Type: `(file: string) => Args | void | Promise<Args | void>`

Only for `compile()`. The values to render each template with. It receives the path of the template file.

### options.minify
Type: `(html: string) => string`

Only for `compile()`. Changes each rendered template, such as to minify its HTML.
