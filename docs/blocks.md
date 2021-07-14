# Custom Blocks

You can include and use your own template helpers!

In order to do so, custom blocks must be defined via [`options.blocks`](/docs/api.md#optionsblocks) during calls to `tempura.compile` and/or `tempura.transform`.

> **Important:** A parsing error will be thrown when a template references a custom block (eg, `{{#foo}}`) but _has not defined_ an `options.blocks.foo` function.


## Definition

All custom blocks are defined as stateless functions. They will receive an `args` object (see [Arguments](#arguments)) and are expected to return a string.

For example, let's have a custom `script` block that's responsible for producing a valid `<script/>` HTML tag. It expects to receive a `src` and may optionally receive a `type` and `defer` value:

```js
let options = {
  blocks: {
    script(args) {
      let { src, defer, type } = args;

      let output = `<script src="${src}"`;
      if (type) output += ` type="${type}"`;
      if (defer) output += ' defer';
      output += '></script>';

      return output;
    }
  }
});
```

It can then be used anywhere within a template:

```hbs
{{! custom "script" block }}
{{#script src="main.js" defer=true }}
```

You may define `async` custom blocks, too. <br>However, you must remember to enable [`options.async`](/docs/api.md#optionsasync)!

```js
import { send } from 'httpie';

let options = {
  blocks: {
    async nasdaq(args) {
      let { symbol } = args;
      let output = `<dt>${symbol}</dt>`;

      // DEMO: Send a GET request to some Stock Ticker API
      let res = await send('GET', `https://.../symbols/${symbol}`);
      output += `<dl>${res.data.price}</dl>`;

      return output;
    }
  }
});
```

It can then be used anywhere within a template:

```hbs
<dl>
  {{#nasdaq symbol="AAPL" }}
  {{#nasdaq symbol="GOOG" }}
  {{#nasdaq symbol="MSFT" }}
</dl>
```


## Arguments

Your template code may pass arguments to your custom blocks.

Arguments are whitespace delimited and every key must be followed by an `=` and some value. For example:

```hbs
{{#person name="Luke" age=31 }}
```

Tempura will parse your blocks' arguments into an object before calling your block definition:

```js
let render = tempura.compile('...', {
  blocks: {
    person(args) {
      let { name, age } = args;
      return `${name} is ${age} years old.`;
    }
  }
});
```

Argument values may be any valid JavaScript data type and may also reference other variables:

```hbs
{{#expect list}}

{{#var count = list.length}}

{{#if count > 0}}
  {{#table
    items=list total=count
    max=25 sticky=true }}
{{/if}}
```

> **Note:** You can write Arrays and objects inline, but it can get messy!


## Invoking Blocks from Blocks

Sometimes your custom block(s) may need to reference other custom blocks. For example, let's assume a `#foo` block wants to print a `#bar` block under some condition. In other for this to work, both the `foo` and `bar` blocks need to be defined.

The naiive approach is to hoist helper function(s) and reference them in both block definintions:

```js
function helper(value) {
  return `<bar>${value}</bar>`;
}

let blocks = {
  foo(args) {
    let output = '<foo>';
    if (args.other) output += helper(args.other);
    return output + '</foo>';
  },
  bar(args) {
    return helper(args.name);
  }
};

let render = tempura.compile('{{#foo other=123}} – {{#bar name="Alice"}}', { blocks });
render(); //=> "<foo><bar>123</bar></foo> – <bar>Alice</bar>"
```

While this _does_ work and is a totally valid approach, tempura allows you to skip the helper functions & reference the other custom blocks directly. The above example can be rewritten as:

```js
let options = {
  blocks: {
    // NOTE: `blocks` parameter === `options.blocks` object
    foo(args, blocks) {
      let output = '<foo>';
      if (args.other) {
        // Call the `bar` method directly
        output += blocks.bar({ name: args.other });
      }
      return output + '</foo>';
    },
    // NOTE: `blocks` parameter === `options.blocks` object
    bar(args, blocks) {
      return `<bar>${args.name}</bar>`;
    }
  }
};

let render = tempura.compile('{{#foo other=123}} – {{#bar name="Alice"}}', options);
render(); //=> "<foo><bar>123</bar></foo> – <bar>Alice</bar>"
```

> **Important:** Notice that when the `foo` definition invoked `blocks.bar`, it had to construct a `{ name }` object to accommodate the `bar` definition's expected arguments.


## Recursive Blocks

As shown in the previous section, block definitions can directly reference one another. However, blocks can also invoke _themselves_ recursively.

> **Important** You must include your own exit condition(s) in order to avoid an infinite loop / `Maximum call stack` error!

In this example, a `#loop` directive should print its current value until `0`:

```js
let blocks = {
  loop(args, blocks) {
    let value = args.value;
    let output = String(value);
    if (value--) {
      output += " ~> " + blocks.loop({ value }, blocks);
    }
    return output;
  }
}

let render = tempura.compile('{{#loop value=3 }}', { blocks });
render(); //=> "3 ~> 2 ~> 1 ~> 0"
```


## Compiler Blocks

If you looked through the [TypeScript definitions](/src/index.d.ts), you may have noticed that custom blocks and the output from `tempura.compile` share the same `Compiler` interface. In other words, they both produce or expect a function with the `(data, blocks?) => Promise<string> | string` signaure.

This means that you can actually _use and compose_ `tempura.compile` functions within your `options.blocks` definitions!

Let's rebuild the same example from [Invoking Blocks from Blocks](#invoking-blocks-from-blocks), but using `#foo` and `#bar` statements only:

```js
// Declare `blocks` variable upfront, for reference.
// This is needed so that `foo` and can see `bar` block exists.
let blocks = {
  bar: tempura.compile(`
    {{#expect name}}
    <bar>{{ name }}</bar>
  `),
};

blocks.foo = tempura.compile(`
  {{#expect other}}
  <foo>
    {{#if other}}
      {{#bar name=other }}
    {{/if}}
  </foo>
`, { blocks });

let render = tempura.compile('{{#foo other=123}} – {{#bar name="Alice"}}', { blocks });
render(); //=> "<foo><bar>123</bar></foo> – <bar>Alice</bar>"
```


## Recursive Compiler Blocks

As with normal [recursive blocks](#recursive-blocks), your custom block definition may still reference itself when using `tempura.compile` to produce a `Compiler`.

The "trick" is to define an `options.blocks` object early so that the same object can be passed into the definition's `tempura.compile` call. Additionally, any directives must already exist as keys in this empty object.

For example, the `loop` directive (from above) must be defined like so:

```js
let blocks = {
  // PLACEHOLDER
  loop: null,
};

// Define `loop`, with `blocks` reference
blocks.loop = tempura.compile(`
  {{#expect value }}

  {{ value }}
  {{#if value-- }}
    ~> {{#loop value=value }}
  {{/if}}
`, { blocks });

let render = tempura.compile('{{#loop value=3 }}', { blocks });
render(); //=> "3 ~> 2 ~> 1 ~> 0"
```

This may seem a little odd at first, but this needs to happen because when the `blocks.loop` definition is parsed, it needs to see a `loop` key inside the `options.blocks` object. During generation, the block's _key_ only needs to exist. The functional definition only needs to be set once the top-level `render` is invoked.
