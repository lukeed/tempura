# Benchmarks

> All benchmarks run on an Apple M1 Max, with Node v26.11.1 and Bun v1.4.3.

Run them from this folder:

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
pug:          42.123ms    pug:          37.14ms
ejs:           0.523ms    ejs:           0.50ms
handlebars:    7.172ms    handlebars:    6.34ms
yeahjs:        0.192ms    yeahjs:        0.21ms
dot:           0.341ms    dot:           0.33ms
art-template:  2.131ms    art-template:  2.22ms
tempura:       0.312ms    tempura:       0.34ms
```

## Compile Time

How quickly a template is parsed and generated into a `function` equivalent.

Results display the average of the first 5 runs, in milliseconds, so they include the time to warm up.

> **Important:** All candidates use a different template syntax.

> **Note:** `handlebars` compiles lazily, on the first render, so its compile time does not include the work to parse the template.

```
Benchmark (Compile), Node
  ~> pug                2.97110ms
  ~> handlebars         0.01387ms
  ~> ejs                0.13767ms
  ~> yeahjs             0.05529ms
  ~> dot                0.11380ms
  ~> art-template       0.35427ms
  ~> tempura            0.09362ms

Benchmark (Compile), Bun
  ~> pug                3.10602ms
  ~> handlebars         0.01638ms
  ~> ejs                0.11977ms
  ~> yeahjs             0.04783ms
  ~> dot                0.05522ms
  ~> art-template       0.32724ms
  ~> tempura            0.09738ms
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
  pug                x 55,636 ops/sec ±0.90% (101 runs sampled)
  handlebars         x 13,525 ops/sec ±0.28% (96 runs sampled)
  ejs                x  1,372 ops/sec ±0.29% (97 runs sampled)
  yeahjs             x 55,051 ops/sec ±0.20% (102 runs sampled)
  dot                x 72,558 ops/sec ±0.50% (100 runs sampled)
  art-template       x 74,486 ops/sec ±0.31% (99 runs sampled)
  tempura            x 67,844 ops/sec ±0.72% (92 runs sampled)

Benchmark (Render), Bun
  pug                x 43,762 ops/sec ±0.60% (93 runs sampled)
  handlebars         x 13,860 ops/sec ±0.36% (99 runs sampled)
  ejs                x  1,903 ops/sec ±0.33% (98 runs sampled)
  yeahjs             x 56,607 ops/sec ±0.46% (93 runs sampled)
  dot                x 85,148 ops/sec ±0.50% (97 runs sampled)
  art-template       x 50,877 ops/sec ±0.33% (97 runs sampled)
  tempura            x 93,028 ops/sec ±0.72% (97 runs sampled)
```

## Render – Escaped Values

Measures how quickly the generated functions render an output string. All template **values are escaped**, unlike the [Raw Values benchmark](#render---raw-values) above.

> **Important:** All candidates use a different `escape()` sequence.

```
Benchmark (Render), Node
  pug                x 4,098 ops/sec ±0.50% (99 runs sampled)
  handlebars         x 2,080 ops/sec ±0.11% (98 runs sampled)
  ejs                x   822 ops/sec ±0.25% (96 runs sampled)
  yeahjs             x 2,762 ops/sec ±0.29% (99 runs sampled)
  dot                x 1,906 ops/sec ±0.22% (100 runs sampled)
  art-template       x 3,950 ops/sec ±0.15% (101 runs sampled)
  tempura            x 4,674 ops/sec ±0.14% (100 runs sampled)

Benchmark (Render), Bun
  pug                x 5,381 ops/sec ±1.80% (91 runs sampled)
  handlebars         x 2,484 ops/sec ±0.54% (99 runs sampled)
  ejs                x 1,013 ops/sec ±4.47% (92 runs sampled)
  yeahjs             x 3,119 ops/sec ±0.45% (98 runs sampled)
  dot                x 2,167 ops/sec ±1.05% (98 runs sampled)
  art-template       x 5,867 ops/sec ±0.71% (95 runs sampled)
  tempura            x 6,359 ops/sec ±0.77% (94 runs sampled)
```
