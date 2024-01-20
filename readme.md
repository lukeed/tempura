<div align="center">
  <img src="logo.png" alt="tempura" height="190" />
</div>

<div align="center">
  <a href="https://npmjs.org/package/tempura">
    <img src="https://badgen.now.sh/npm/v/tempura" alt="version" />
  </a>
  <a href="https://travis-ci.org/lukeed/tempura">
    <img src="https://github.com/lukeed/tempura/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://licenses.dev/npm/tempura">
    <img src="https://licenses.dev/b/npm/tempura" alt="licenses" />
  </a>
  <a href="https://npmjs.org/package/tempura">
    <img src="https://badgen.now.sh/npm/dm/tempura" alt="downloads" />
  </a>
  <a href="https://codecov.io/gh/lukeed/tempura">
    <img src="https://badgen.now.sh/codecov/c/github/lukeed/tempura" alt="codecov" />
  </a>
</div>

<div align="center">A light, crispy, and delicious template engine 🍤</div>

## Features

* **Extremely lightweight**<br>
  _Everything is `1.26 kB` (gzip) – even less with tree-shaking!_

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

let toCJS = transform(template, { format: 'cjs' });
console.log(typeof toCJS); //=> "string"
console.log(toCJS);
//=> `var $$1=require("tempura").esc;module.exports=function($$3,$$2){...}`


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

Visit the [API](/docs/api.md) and [Custom Blocks](/docs/blocks.md) for documentation.


## Benchmarks

> Running via Node v14.15.13

Please visit the [`/bench`](/bench) directory for complete, reproducible benchmarks.

The following is a subset of the full results, presented without context. Again, please visit [`/bench`](/bench) for explanations, comparisons, and/or differences.

```
Benchmark: Render w/ raw values (no escape)
  pug                x 34,847 ops/sec ±2.79% (93 runs sampled)
  handlebars         x  6,700 ops/sec ±1.41% (92 runs sampled)
  ejs                x    802 ops/sec ±0.54% (94 runs sampled)
  dot                x 40,704 ops/sec ±3.08% (93 runs sampled)
  art-template       x 39,839 ops/sec ±0.86% (90 runs sampled)
  tempura            x 44,656 ops/sec ±0.42% (92 runs sampled)

Benchmark: Render w/ escaped values
  pug                x 2,800 ops/sec ±0.31% (95 runs sampled)
  handlebars         x   733 ops/sec ±0.34% (94 runs sampled)
  ejs                x   376 ops/sec ±0.17% (91 runs sampled)
  dot                x   707 ops/sec ±0.15% (96 runs sampled)
  art-template       x 2,707 ops/sec ±0.12% (96 runs sampled)
  tempura            x 2,922 ops/sec ±0.31% (96 runs sampled)
```

## License

MIT © [Luke Edwards](https://lukeed.com)
