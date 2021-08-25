# API

> **Note:** You may also refer to the [TypeScript definitions](/src/index.d.ts).

## Methods


### tempura.esc(value)
Returns: `string`

#### value
Type: `string` or `unknown`

The value to be HTML-escaped. The following special characters are escaped: `"`, `&`, and `<`.

> **Note:** Any non-`string` values are coerced to a strings!
>  * `null` and `undefined` become `""`
>  * `{ foo: 123 }` becomes `"[object Object]"`
>  * `[1, 2, 3]` becomes `"1,2,3"`
>  * `123` becomes `"123"`


### tempura.compile(input, options?)
Returns: `Compiler`

Convert a template into a `function` that can be executed.

When called with the appropriate, template-specific arguments, the `Compiler` function will return a `string` or a `Promise<string>`, resulting in the desired template output.

```js
let render = tempura.compile(`
  {{#expect age}}
  {{#if age < 100}}
    You're not 100+ yet
  {{#else}}
    What's the secret?
  {{/if}}
`);

console.log(typeof render);
//=> "function"

render({ age: 31 });
//=> "You're not 100+ yet"

render({ age: 102 });
//=> "What's the secret?"
```


#### input
Type: `string`

The template to be converted.

#### options

All common [Options](#options-2) are supported, in addition to:

#### options.escape
Type: `(value: any) => string`
Default: `typeof tempura.esc`

The escape function to use for `{{{ raw }}}` values.

When unspecified, [`tempura.esc`](#tempuraescvalue) is used by default;


### tempura.transform(input, options?)
Returns: `string`

Transforms the `input` source template into a string-representation of the equivalent JavaScript function.

Unlike [`tempura.compile`](#tempuracompileinput-options), this generates a `string` instead of a `function`, which makes this method suitable for bundler transformations and/or replacing code at build-time.

```js
let template = `
  {{#expect age}}
  {{#if age < 100}}
    You're not 100+ yet
  {{#else}}
    What's the secret?
  {{/if}}
`;

// produces ESM format by default
let esm = tempura.transform(template);
console.log(typeof esm); //=> "string"
console.log(esm);
//=> 'import{esc as $$1}from"tempura";export default function($$3,$$2){var{age}=$$3,x=``;x+=``;if(age < 100){x+=`You\'re not 100+ yet"`;}else{x+=`What\'s the secret?`;}return x}'
```

#### input
Type: `string`

The template to be converted.

#### options

All common [Options](#options-2) are supported, in addition to:

#### options.format
Type: `"esm"` or `"cjs"`<br>
Default: `"esm"`

Modify the generated output to be compliant with the CommonJS or ES Module format.

> **Note:** Most bundlers and/or upstream consumers can understand (and prefer) the ESM format.


## Options

### options.async
Type: `boolean`<br>
Default: `false`

When true, `tempura.compile` produces an `AsyncFunction` and `tempura.compile` generates an `async` function. Also will include the `await` keyword when a [Custom Block](/docs/blocks.md) is invoked.


### options.props
Type: `string[]`

The _names_ of variables that will be provided to a view.

Declaring `props` names means that they don't have to appear within any `{{#expect ...}}` declarations – and vice versa. In other words, `options.props` is a programmatic way to define (or skip) `{{#expect}}` blocks.

It is recommended that you include global and/or shared variables within `options.props`, which saves you the trouble of writing the same `{{#expect foo, bar}}` statements over and over. This way, each template can `{{#expect}}` any variables that are unique to it.

> **Note:** Variable names are deduped. For example, defining `{{#expect foo}}` _and_ `options.props: ['foo']` will not have any adverse/duplicative effects.


### options.loose
Type: `boolean`<br>
Default: `false`

By default, any template variables must be known ahead of time – either through [`options.props`](/docs/api.md#optionsprops) or through [`#expect`](/docs/syntax.md#expect) declarations. However, when enabled, `options.loose` relaxes this constraint.

> **Note:** Enabling `options.loose` makes for a more Handlebars-like experience.

With this option activated, removing the `#expect` declaration from the example below will produce the same output:

```diff
--{{#expect name}}
<p>Hello, {{ name }}!</p>
```


### options.blocks
Type: `Record<string, Compiler>`

Any [custom directives](/docs/blocks.md) that should be made available within the template.

> **Important:** An error will be thrown while parsing if a custom directive was found but not defined.

All key names are converted into the directive names. Keys must start with a `A-Z`, `a-z`, or `_` and may include any number of `A-Z`, `a-z`, `_`, or `0-9` characters.

For example, in order to define and use the `{{#foo}}` and `{{#hello123}}` directives within a template, an `options.blocks` object with `foo` and `hello123` keys must be defined:

```js
/**
 * @type {tempura.Options}
 */
let options = {
  async: true,
  blocks: {
    foo(args) {
      return `<span>foo got ~${args.value}~</span>`;
    },
    async hello123(args) {
      return `<h1>hello123 got ~${args.name}~</h1>`;
    }
  }
};

let template = `
  {{#foo value=123 }}
  {{#hello123 name="world" }}
`;

// NOTE: Works with `transform` too
await tempura.compile(template, options)();
//=> "<span>foo got ~123~</span><h1>hello123 got ~world~</h1>"
```
