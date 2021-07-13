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
