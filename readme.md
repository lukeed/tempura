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
  <a href="https://codecov.io/gh/lukeed/TODO">
    <img src="https://badgen.now.sh/codecov/c/github/lukeed/TODO" alt="codecov" />
  </a>
  <a href="https://npmjs.org/package/TODO">
    <img src="https://badgen.now.sh/npm/dm/TODO" alt="downloads" />
  </a>
</div>

<div align="center">A light, crispy, and delicious template engine 🍤</div>

## Features

* **Extremely lightweight**<br>
  _Everything is `1.25 kB` (gzip) – even less with tree-shaking!_

* **Super Performant**<br>
  _Significantly [faster](#benchmarks) than the big names; and the small ones._

* **Familiar Syntax**<br>
  _Tempura templates look great with Handlebars syntax highlighting._

* **Custom Directives**<br>
  _Easily define custom directives, via the [API](#API), to extend functionality._

## Install

```
$ npm install --save tempura
```

## Usage

```js
// TODO
```

## Syntax

TODO

## API

> **Note:** All methods share common [Options](#options).

### tempura.compile(input, options?)
Returns: `(data: object) => string`

Convert a template into an executable `function` equivalent.

This function will produce a `string` output based on the data you provide. The `data` key names should match the `#expect`ed variable names.

#### input
Type: `string`

The template to be converted.

#### options.escape
Type: `(value: any) => string`

todo

### tempura.transform(input, options?)
Returns: `string`

Transforms the `input` source template into JavaScript code. Unlike `tempura.compile()`, this generates a `string` instead of a `function`, which means that this method is likely only suitable for generating and/or replacing code at build-time.

#### input
Type: `string`

The template to be converted.

#### options.format
Type: `"esm"` or `"cjs"`<br>
Default: `"esm"`

Modify the generated output to be compliant with the CommonJS or ES Module format.

> **Note:** Most bundlers and/or upstream consumers can understand (and prefer) the ESM format.

## Options

#### options.props
Type: `string[]`

The _names_ of variables that will be provided to a view.

> **NOTE:** Declaring `options.props` names _could_ take the place of `{{#expect ...}}` declarataions – and vice versa. In other words, `options.props` is a programmatic way to define (or skip) `{{#expect}}` blocks. Declaring a variable name in both locations has no effect.

#### options.blocks
Type: `{ ... }`

TODO: extra actions/blocks

## Benchmarks

> Running via Node v14.15.13

Please visit the [`/bench`](/bench) directory for complete, reproducible benchmarks.

The following is a subset of the full results, presented without context. Again, please visit [`/bench`](/bench) for explanations and/or comparisons.

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
