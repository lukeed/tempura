# Benchmarks

> All benchmarks run on an Apple M1 Max, with Node v26.11.1 and Bun v1.4.3. Each library loads with `require()`; tempura loads as an ES Module through it.

The benchmarks load tempura from `dist/`, so build it first, from the repository root:

```sh
bun install
bun run build
```

Then run them from this folder:

```sh
bun install
node raw.js
node escape.js
```

To run them with Bun, use `bun raw.js` and `bun escape.js`.

## Load Time

Measures how long it takes to `require` a library.

```
Node                      Bun
pug:          44.903ms    pug:          36.43ms
ejs:           0.486ms    ejs:           0.49ms
handlebars:    7.698ms    handlebars:    5.89ms
yeahjs:        0.191ms    yeahjs:        0.20ms
dot:           0.358ms    dot:           0.32ms
art-template:  2.435ms    art-template:  2.28ms
tempura:       0.313ms    tempura:       0.27ms
```

## Compile Time

How quickly a template is parsed and generated into a `function` equivalent.

Results display the average of the first 5 runs, in milliseconds, so they include the time to warm up.

> **Important:** All candidates use a different template syntax.

> **Note:** `handlebars` compiles lazily, on the first render, so its compile time does not include the work to parse the template.

```
Benchmark (Compile), Node
  ~> pug                3.07165ms
  ~> handlebars         0.02100ms
  ~> ejs                0.14615ms
  ~> yeahjs             0.05810ms
  ~> dot                0.11615ms
  ~> art-template       0.38245ms
  ~> tempura            0.10018ms

Benchmark (Compile), Bun
  ~> pug                2.97073ms
  ~> handlebars         0.01667ms
  ~> ejs                0.11263ms
  ~> yeahjs             0.04170ms
  ~> dot                0.05487ms
  ~> art-template       0.30245ms
  ~> tempura            0.08503ms
```

## Render - Raw Values

Measures how quickly the generated functions render an output string.

> **Note:** All candidates **do not escape** template values - hence "raw" values.

All candidates produce the **same** output value, which is used as a validation step.

```
Validation (Render)
  ✔ pug
  ✔ handlebars
  ✔ ejs
  ✔ yeahjs
  ✔ dot
  ✔ art-template
  ✔ tempura

Benchmark (Render), Node
  pug                x 54,320 ops/sec ±1.12% (98 runs sampled)
  handlebars         x 13,553 ops/sec ±0.12% (98 runs sampled)
  ejs                x  1,372 ops/sec ±0.21% (100 runs sampled)
  yeahjs             x 54,951 ops/sec ±0.13% (102 runs sampled)
  dot                x 71,294 ops/sec ±0.61% (101 runs sampled)
  art-template       x 73,490 ops/sec ±0.25% (95 runs sampled)
  tempura            x 66,696 ops/sec ±0.51% (92 runs sampled)

Benchmark (Render), Bun
  pug                x 43,482 ops/sec ±0.85% (95 runs sampled)
  handlebars         x 13,978 ops/sec ±0.48% (96 runs sampled)
  ejs                x  1,890 ops/sec ±0.35% (95 runs sampled)
  yeahjs             x 56,062 ops/sec ±0.54% (94 runs sampled)
  dot                x 84,336 ops/sec ±4.68% (96 runs sampled)
  art-template       x 50,749 ops/sec ±0.88% (93 runs sampled)
  tempura            x 92,825 ops/sec ±0.38% (94 runs sampled)
```

## Render – Escaped Values

Measures how quickly the generated functions render an output string. All template **values are escaped**, unlike the [Raw Values benchmark](#render---raw-values) above.

> **Important:** All candidates use a different `escape()` sequence.

```
Benchmark (Render), Node
  pug                x 4,641 ops/sec ±0.31% (98 runs sampled)
  handlebars         x 2,135 ops/sec ±0.28% (98 runs sampled)
  ejs                x   808 ops/sec ±0.17% (96 runs sampled)
  yeahjs             x 2,789 ops/sec ±4.33% (96 runs sampled)
  dot                x 1,967 ops/sec ±0.28% (97 runs sampled)
  art-template       x 4,550 ops/sec ±2.33% (97 runs sampled)
  tempura            x 5,191 ops/sec ±1.41% (99 runs sampled)

Benchmark (Render), Bun
  pug                x 5,560 ops/sec ±0.60% (94 runs sampled)
  handlebars         x 2,494 ops/sec ±0.29% (98 runs sampled)
  ejs                x 1,081 ops/sec ±0.40% (96 runs sampled)
  yeahjs             x 3,133 ops/sec ±0.28% (97 runs sampled)
  dot                x 2,176 ops/sec ±0.13% (99 runs sampled)
  art-template       x 5,937 ops/sec ±0.45% (95 runs sampled)
  tempura            x 6,402 ops/sec ±0.62% (93 runs sampled)
```
