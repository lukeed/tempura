<div align="center">
  <img src="logo.png" alt="tempura" height="190" />
</div>

<div align="center">
  <a href="https://npmjs.org/package/tempura">
    <img src="https://badgen.now.sh/npm/v/tempura" alt="version" />
  </a>
  <a href="https://github.com/lukeed/tempura/actions">
    <img src="https://github.com/lukeed/tempura/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://licenses.dev/npm/tempura">
    <img src="https://licenses.dev/b/npm/tempura" alt="licenses" />
  </a>
  <a href="https://npmjs.org/package/tempura">
    <img src="https://badgen.now.sh/npm/dm/tempura" alt="downloads" />
  </a>
</div>

<div align="center">A light, crispy, and delicious template engine 🍤</div>

## Features

* **Extremely lightweight**<br>
  _Everything is `2.26 kB` (gzip) – even less with tree-shaking!_

* **Super Performant**<br>
  _Significantly [faster](#benchmarks) than the big names; and the small ones._

* **Familiar Syntax**<br>
  _Tempura templates look great with Handlebars syntax highlighting._

* **Custom Directives**<br>
  _Easily define [custom blocks](/docs/blocks.md), via the [API](/docs/api.md), to extend functionality._

## Install

```
$ npm install --save tempura
```

Tempura is an ES Module for Node 22+ and Bun. Load it with `import`, or with `require()` in Node 22.12+ and Bun.

## Usage

> Visit the [`/examples`](/examples) and [Syntax Cheatsheet](/docs/syntax.md) for more info!

***example.hbs***

```hbs
{{! expected props to receive }}
{{#expect title, items }}

{{! inline variables }}
{{#var count = items.length }}
{{#var suffix = count === 1 ? 'task' : 'tasks' }}

{{#if count == 0}}
  <p>You're done! 🎉</p>
{{#else}}
  <p>You have {{{ count }}} {{{ suffix }}} remaining!</p>

  {{#if count == 1}}
    <small>Almost there!</small>
  {{#elif count > 10}}
    <small>... you must be <em>fried</em> 😔</small>
  {{#else}}
    <small>You've got this 💪🏼</small>
  {{/if}}

  <ul>
    {{#each items as todo}}
      <li>{{ todo.text }}</li>
    {{/each}}
  </ul>
{{/if}}
```

***render.js***

```js
import { readFile } from 'fs/promises';
import { transform, compile } from 'tempura';

const template = await readFile('example.hbs', 'utf8');

// Transform the template into a function
// NOTE: Produces a string; ideal for build/bundlers
// ---

let toESM = transform(template);
console.log(typeof toESM); //=> "string"
console.log(toESM);
//=> `import{esc as $$1}from"tempura";export default function($$3,$$2){...}`


// Convert the template into a live function
// NOTE: Produces a `Function`; ideal for runtime/servers
// ---

let render = compile(template);
console.log(typeof render); //=> "function"
render({
  title: 'Reminders',
  items: [
    { id: 1, text: 'Feed the doggo' },
    { id: 2, text: 'Buy groceries' },
    { id: 3, text: 'Exercise, ok' },
  ]
});
//=> "<p>You have 3 tasks remaining!</p>\n"
//=> + "<small>You've got this 💪🏼</small>\n\n"
//=> + "<ul>\n"
//=> + "  <li>Feed the doggo</li>\n"
//=> + "  <li>Buy groceries</li>\n"
//=> + "  <li>Exercise, ok</li>\n"
//=> + "</ul>"
```

## Syntax

Please refer to the [Syntax Cheatsheet](/docs/syntax.md).


## API

Visit the [API](/docs/api.md), [Custom Blocks](/docs/blocks.md), and [Plugins](/docs/plugins.md) for documentation.


## Benchmarks

> Running via Node v26.11.1 and Bun v1.4.3, on an Apple M1 Max

Please visit the [`/bench`](/bench) directory for complete, reproducible benchmarks.

The following is a subset of the full results, presented without context. Again, please visit [`/bench`](/bench) for explanations, comparisons, and/or differences.

```
Benchmark: Render w/ raw values (no escape), Node
  pug                x 54,320 ops/sec ±1.12% (98 runs sampled)
  handlebars         x 13,553 ops/sec ±0.12% (98 runs sampled)
  ejs                x  1,372 ops/sec ±0.21% (100 runs sampled)
  dot                x 71,294 ops/sec ±0.61% (101 runs sampled)
  art-template       x 73,490 ops/sec ±0.25% (95 runs sampled)
  tempura            x 66,696 ops/sec ±0.51% (92 runs sampled)

Benchmark: Render w/ raw values (no escape), Bun
  pug                x 43,482 ops/sec ±0.85% (95 runs sampled)
  handlebars         x 13,978 ops/sec ±0.48% (96 runs sampled)
  ejs                x  1,890 ops/sec ±0.35% (95 runs sampled)
  dot                x 84,336 ops/sec ±4.68% (96 runs sampled)
  art-template       x 50,749 ops/sec ±0.88% (93 runs sampled)
  tempura            x 92,825 ops/sec ±0.38% (94 runs sampled)

Benchmark: Render w/ escaped values, Node
  pug                x 4,641 ops/sec ±0.31% (98 runs sampled)
  handlebars         x 2,135 ops/sec ±0.28% (98 runs sampled)
  ejs                x   808 ops/sec ±0.17% (96 runs sampled)
  dot                x 1,967 ops/sec ±0.28% (97 runs sampled)
  art-template       x 4,550 ops/sec ±2.33% (97 runs sampled)
  tempura            x 5,191 ops/sec ±1.41% (99 runs sampled)

Benchmark: Render w/ escaped values, Bun
  pug                x 5,560 ops/sec ±0.60% (94 runs sampled)
  handlebars         x 2,494 ops/sec ±0.29% (98 runs sampled)
  ejs                x 1,081 ops/sec ±0.40% (96 runs sampled)
  dot                x 2,176 ops/sec ±0.13% (99 runs sampled)
  art-template       x 5,937 ops/sec ±0.45% (95 runs sampled)
  tempura            x 6,402 ops/sec ±0.62% (93 runs sampled)
```

## License

MIT © [Luke Edwards](https://lukeed.com)
