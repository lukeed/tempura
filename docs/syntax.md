# Syntax

> A quick cheatsheet of the tempura template syntax.

The tempura template syntax is _very similar_ to the [Handlebars](https://handlebarsjs.com/guide/) or [Mustache](https://mustache.github.io/#demo) template syntax. <br>In fact, they're more similar than they are different!

> **General Notice**
> Throughout this document, you'll notice that most examples include HTML tags or _produce_ HTML output. This is done only because HTML is a common target. Tempura templates ***do not*** need to use or produce HTML content – it only cares about its own template syntax!

## Overview

Templates are (hopefully!) an easier way to write and maintain view logic. Nearly all template engines, including `tempura`, parse your template files and generate a function (per template) that includes all your view logic and desired output.

Each of these functions is valid JavaScript and is waiting to accept an `input` object. Together, the input data and the render function produce the expected output.

## Expressions

Values can be printed by wrapping content with the `{{` and `}}` characters. These can appear anywhere within your template, and typically reference a variable name, although they could wrap _any value_.

When the template is evaluated, these expressions are replaced. For example:

```hbs
{{#expect name}}
<p>Hello, {{ name }}!</p>
```

rendered with the input:

```js
{ name: 'world' }
```

produces the result:

```html
<p>Hello, world!</p>
```

Expression values can reference any defined variables. In this example, `name` was a simple string, but it could have been an object, an Array, or anything else!

For example, this template:

```hbs
<p>Items left: {{ items.length }}</p>
```

with this input object:

```js
{
  items: ["foo", "bar", "baz"]
}
```

produces this output:

```html
<p>Items left: 3</p>
```

### Escaped Values

By default, all expressions are HTML-escaped. For example, if the value contains the `"`, `&`, or `<` characters, they'd be encoded into the `&quot;`, `&amp;`, and `&lt;` sequences, respectively.

> **Note:** The HTML-escape function can be customized via the [`escape`](/docs/api.md#optionsescape) option.

It's generally recommended to use HTML-escaping unless you're certain that the expression's value does not contain any HTML characters; eg, it's a number or you just constructed it via [`#var`](#var).

### Raw Values

To disable HTML-escaping for a value, you must use the triple-curly syntax; for example `{{{ value }}}`.

When the triple-curly is used, the _raw value_ is printed as is.

```hbs
{{! input }}
escaped: {{ 'a & b " c < d' }}
raw: {{{ 'a & b " c < d' }}}
```

```html
<!-- output -->
escaped: a &amp; b &quot; c &lt; d
raw: a & b " c < d
```


## Comments

It's generally recommended to include comments within your templates, especially as their complexity grows!

Template comments will never appear in the rendered output. However, HTML comments are kept.

```hbs
<!-- HTML comments are kept in output -->
{{! template comments are removed }}
{{!
  template comments
  can also be multi-line
  ...and are still removed
!}}
<p>hello world</p>
```

## Helpers

The tempura syntax comes with few (but powerful) template helpers!

Unlike value expressions, template helpers – or "blocks" – always use double-curly tags. This is because they're _not_ values, so there's no HTML-escape vs raw dilemma. The shorter, double-curly tag is used as a convenience.

> **Note:** You may define your own helpers! See [Custom Blocks](/docs/blocks.md) for more detail.

### `#expect`

A template needs to declare what variables it _expects_ to receive. In several UI frameworks, this is generally referred to as defining your "props". At the parser level, this prepares the `Compiler` so that it won't throw any `Uncaught ReferenceError`s during execution.

> **Note:** You should hoist common variables via [`options.props`](/docs/api.md#optionsprops) to avoid repetitive `#expect` declarations.

You may declare multiple variables within the same `#expect` block. You may also have multiple `#expect` blocks in the same file:

```hbs
{{#expect name}}
{{#expect foo, bar}}
{{#expect
    hello,
    title, todos }}
```

### `#var`

You may define new variables within your template and reference them throughout the file. Normal JavaScript scoping rules apply.

These inline variables can evaluate any JavaScript and can reference other template variables.

Only one variable can be defined per `#var` block. You may have any number of `#var` blocks in your template:

```hbs
{{#expect todos}}
{{#var numTotal = todos.length}}
{{#var numDone = todos.filter(x => x.done).length}}
{{#var numActive = numTotal = numDone}}

<p>You have {{{ numActive }}} item(s) remaining</p>
<p>You have {{{ numTotal }}} item(s) in total</p>
```

### `#if`, `#elif`, `#else`

Your control flow helpers!

Just like JavaScript, use of `#elif` (short for `else if`) and `#else` are optional, but must always be associated with and follow an `#if` opener. Parenthesis around the `#if` and `#elif` conditions are optional:

All `#if` blocks must be terminated by an `/if` block.

```hbs
{{#expect age, isActive}}

{{#if isActive}}
  <p>Good for you!</p>
{{/if}}

{{#if isActive}}
  <p>Good for you!</p>
{{#else}}
  <p>How about 1 hour a week?</p>
{{/if}}

{{#var senior = age >= 70}}

{{#if senior && isActive}}
  <p>Wow, that's amazing!</p>
{{#elif isActive}}
  <p>Good for you!</p>
{{#elif senior}}
  <p>How about water aerobics?</p>
{{#else}}
  <p>How about kick boxing?</p>
{{/if}}
```

### `#each`

The `#each` block loops over an Array, passing through each value and index to the template expression(s) within the block.

All `#each` blocks must be terminated by an `/each` block.

```hbs
{{#expect items}}

{{! only use the value }}
{{#each items as item}}
  <div class="task">
    <strong class="title">{{ item.title }}</strong>
    <span class="text">{{ item.text }}</span>
  </div>
{{/each}}

{{! use the value & index }}
{{#each items as item,index }}
  <div class="task" data-index="{{{ index }}}">
    <strong class="title">{{ item.title }}</strong>
    <span class="text">{{ item.text }}</span>
  </div>
{{/each}}
```
