# Benchmarks

> All benchmarks run using Node v14.15.3

## Load Time

Measures how long it takes to `require` a library.

```
pug:         127.647ms
ejs:           1.444ms
handlebars:   23.627ms
yeahjs:        0.979ms
dot:           1.363ms
art-template:  8.847ms
tempura:       0.593ms
```

## Compile Time

How quickly a template is parsed and generated into a `function` equivalent.

Results display the average of 5 runs, in milliseconds.

> **Important:** All candidates use a different template syntax.

```
Benchmark (Compile)
  ~> pug                7.20474ms
  ~> handlebars         0.02952ms
  ~> ejs                0.28859ms
  ~> yeahjs             0.12206ms
  ~> dot                0.27055ms
  ~> art-template       0.76982ms
  ~> tempura            0.19813ms
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

Benchmark (Render)
  pug                x 34,847 ops/sec ±2.79% (93 runs sampled)
  handlebars         x  6,700 ops/sec ±1.41% (92 runs sampled)
  ejs                x    802 ops/sec ±0.54% (94 runs sampled)
  yeahjs             x 31,508 ops/sec ±0.30% (97 runs sampled)
  dot                x 40,704 ops/sec ±3.08% (93 runs sampled)
  art-template       x 39,839 ops/sec ±0.86% (90 runs sampled)
  tempura            x 44,656 ops/sec ±0.42% (92 runs sampled)
```

## Render – Escaped Values

Measures how quickly the generated functions render an output string. All template **values are escaped**, unlike the [Raw Values benchmark]($render-raw-values) above.

> **Important:** All candidates use a different `escape()` sequence.

```
Benchmark (Render)
  pug                x 2,800 ops/sec ±0.31% (95 runs sampled)
  handlebars         x   733 ops/sec ±0.34% (94 runs sampled)
  ejs                x   376 ops/sec ±0.17% (91 runs sampled)
  yeahjs             x   873 ops/sec ±0.30% (95 runs sampled)
  dot                x   707 ops/sec ±0.15% (96 runs sampled)
  art-template       x 2,707 ops/sec ±0.12% (96 runs sampled)
  tempura            x 2,922 ops/sec ±0.31% (96 runs sampled)
```
