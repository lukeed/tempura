import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as tempura from '../src/index.ts';

// ---

const transform = suite('transform');

transform('should be a function', () => {
	assert.type(tempura.transform, 'function');
});

transform('should return a string', () => {
	let output = tempura.transform('');
	assert.type(output, 'string');
});

transform('should include "esc" import via "tempura" module', () => {
	let output = tempura.transform('');
	assert.match(output, /\{esc(\:| as )/);
	assert.match(output, '"tempura"');
});

transform('format :: ESM', () => {
	let output = tempura.transform('');
	assert.match(output, 'import{esc as $$1}from"tempura";');
	assert.match(output, ';export default function($$3,$$2){');
	assert.ok(output.endsWith('}'), 'close function');
});

transform('format :: ESM :: async', () => {
	let output = tempura.transform('', { async: true });
	assert.match(output, ';export default async function($$3,$$2){');
});

transform('should bubble parsing errors', () => {
	try {
		tempura.transform('{{#if foo}}stop');
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, 'Unterminated "if" block');
	}
});

transform.run();

// ---

const compile = suite('compile');

compile('should be a function', () => {
	assert.type(tempura.compile, 'function');
});

compile('should return a function', () => {
	let output = tempura.compile('');
	assert.type(output, 'function');
});

compile('should produce valid output :: raw', () => {
	let output = tempura.compile(`
		{{#expect value}}
		{{#if value.length > 10}}
			"{{{ value }}}" is more than 10 characters
		{{#else}}
			"{{{ value }}}" is too short
		{{/if}}
	`);

	assert.is(
		output({ value: '<b>howdy</b>' }).replace(/[\r\n\t]+/g, ''),
		'"<b>howdy</b>" is more than 10 characters'
	);

	assert.is(
		output({ value: '<b>aaa</b>' }).replace(/[\r\n\t]+/g, ''),
		'"<b>aaa</b>" is too short'
	);
});

compile('should produce valid output :: escape', () => {
	let output = tempura.compile(`
		{{#expect value}}
		{{#if value.length > 10}}
			"{{ value }}" is more than 10 characters
		{{#else}}
			"{{ value }}" is too short
		{{/if}}
	`);

	assert.is(
		output({ value: '<b>howdy</b>' }).replace(/[\r\n\t]+/g, ''),
		'"&lt;b>howdy&lt;/b>" is more than 10 characters'
	);

	assert.is(
		output({ value: '<b>aaa</b>' }).replace(/[\r\n\t]+/g, ''),
		'"&lt;b>aaa&lt;/b>" is too short'
	);
});

compile('should allow custom `escape` option :: {{value}}', () => {
	let output = tempura.compile(`
		{{#expect value}}
		value is "{{ value }}"
	`, {
		escape(val) {
			return val.replace('foo', 'bar');
		}
	});

	assert.is(
		output({ value: 'foobar' }).replace(/[\r\n\t]+/g, ''),
		'value is "barbar"'
	);
});

compile('should allow custom `escape` option :: {{{ value }}}', () => {
	let output = tempura.compile(`
		{{#expect value}}
		value is "{{{ value }}}"
	`, {
		escape(val) {
			return val.replace('foo', 'bar');
		}
	});

	assert.is(
		output({ value: 'foobar' }).replace(/[\r\n\t]+/g, ''),
		'value is "foobar"'
	);
});

compile('should bubble parsing errors', () => {
	try {
		tempura.compile('{{#if foo}}stop');
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, 'Unterminated "if" block');
	}
});

compile('should create `async` function', async () => {
	let delta;
	let sleep = ms => new Promise(r => setTimeout(r, ms));
	let normalize = x => x.replace(/[\r\n\t]+/g, '');

	async function delay({ wait }) {
		let x = Date.now();

		await sleep(wait);
		delta = Date.now() - x;
		return `~> waited ${wait}ms!`;
	}

	let render = tempura.compile(`
		{{#expect ms}}
		{{#delay wait=ms }}
	`, {
		async: true,
		blocks: { delay }
	});

	assert.instance(render, Function);
	assert.instance(render, delay.constructor);

	assert.is(
		Object.prototype.toString.call(render),
		'[object AsyncFunction]'
	);

	let foo = await render({ ms: 100 });
	assert.is(normalize(foo), '~> waited 100ms!');
	assert.ok(delta > 99 && delta < 110);

	let bar = await render({ ms: 30 });
	assert.is(normalize(bar), '~> waited 30ms!');
	assert.ok(delta > 29 && delta < 35);
});

compile('should allow `blocks` to call other blocks', () => {
	let blocks = {
		hello(args, blocks) {
			let output = `<h>"${args.name}"</h>`;
			// Always invoke the `foo` block
			output += blocks.foo({ value: 123  });
			// Calls itself; recursive block
			if (args.other) output += blocks.hello({ name: args.other }, blocks);
			return output;
		},
		foo(args) {
			return `<foo>${args.value}</foo>`;
		}
	};

	let render = tempura.compile('{{#hello name="world" other="there"}}', { blocks });

	assert.is(
		render(),
		`<h>"world"</h><foo>123</foo><h>"there"</h><foo>123</foo>`
	);
});

compile('should allow `Compiler` output as blocks', () => {
	let blocks = {
		// initialize foo
		// ~> does NOT use custom blocks
		foo: tempura.compile(`
			{{#expect age}}
			{{#if age > 100}}
				<p>centurion</p>
			{{#else}}
				<p>youngin</p>
			{{/if}}
		`),

		// initial hello
		// ~> placeholder; because self-references
		hello: null,
	};

	blocks.hello = tempura.compile(`
		{{#expect name, other}}

		<h>"{{ name }}"</h>
		{{#foo age=123}}

		{{#if other}}
			{{#hello name=other}}
		{{/if}}
	`,  { blocks });

	let normalize = x => x.replace(/[\r\n\t]+/g, '');
	let render = tempura.compile('{{#hello name="world" other="there"}}', { blocks });

	assert.is(
		normalize(render()),
		`<h>"world"</h><p>centurion</p><h>"there"</h><p>centurion</p>`
	);
});

compile('should support nested `#each` loops', () => {
	let render = tempura.compile(`
		{{#expect groups}}
		{{#each groups as (g)}}
			<h1>{{ g.name }}</h1>
			<ul>{{#each g.items as (it)}}<li>{{ it }}</li>{{/each}}</ul>
		{{/each}}
	`);

	let normalize = x => x.replace(/[\r\n\t]+/g, '');
	let out = normalize(render({
		groups: [
			{ name: 'A', items: ['a1', 'a2'] },
			{ name: 'B', items: ['b1'] },
		],
	}));

	// Outer loop must emit BOTH groups (previously terminated after the first
	// because the inner loop clobbered the outer's `$$a`).
	assert.is(
		out,
		'<h1>A</h1><ul><li>a1</li><li>a2</li></ul><h1>B</h1><ul><li>b1</li></ul>'
	);
});

compile('should support triple-nested `#each` loops', () => {
	let render = tempura.compile(`
		{{#expect data}}
		{{#each data as (outer)}}[{{#each outer as (middle)}}({{#each middle as (leaf)}}{{ leaf }}{{/each}}){{/each}}]{{/each}}
	`);

	let normalize = s => s.replace(/[\r\n\t]+/g, '');
	let out = normalize(render({
		data: [[[1, 2], [3]], [[4]]],
	}));

	assert.is(out, '[(12)(3)][(4)]');
});

compile('should support nested `#each` with implicit `i` index', () => {
	let render = tempura.compile(`
		{{#expect rows}}
		{{#each rows as row}}{{#each row as cell}}{{ i }}:{{ cell }} {{/each}}| {{/each}}
	`);

	let normalize = x => x.replace(/[\r\n\t]+/g, '');
	let out = normalize(render({
		rows: [['a', 'b'], ['c']],
	}));

	// Each `#each` has its own `i`; block scoping keeps them from colliding.
	assert.is(out, '0:a 1:b | 0:c | ');
});

compile('should allow a value named `x`', () => {
	let render = tempura.compile('<p>{{ x }}</p>{{#var y = x + 1}}<b>{{ y }}</b>', { props: ['x'] });
	assert.is(render({ x: 1 }), '<p>1</p><b>2</b>');

	render = tempura.compile('{{#var x = 1}}A{{ x }}');
	assert.is(render(), 'A1');
});

compile('should close a tag after its own braces', () => {
	let render = tempura.compile(`{"a": {{ n }}}|{{ s === '}}' ? 'y' : 'n' }}|{{{ html }}}|{{! it's {a} note }}end`, { props: ['n', 's', 'html'] });
	assert.is(render({ n: 2, s: '}}', html: '<b>' }), '{"a": 2}|y|<b>|end');
});

compile('should read quotes and braces in a regex as part of the regex', () => {
	let render = tempura.compile("{{ s.replace(/`/g, '') }}|{{ s.replace(/`/g, '') }}|{{ s.replace(/['\"]/g, '') }}|{{ s.replace(/[}/]/g, '') }}|{{{ s.replace(/\\}/g, '') }}}", { props: ['s'] });
	assert.is(render({ s: 'a`"\'}/b' }), 'a&quot;&#39;}/b|a&quot;&#39;}/b|a`}/b|a`&quot;&#39;b|a`"\'/b');
});

compile('should read a regex after a block name, an operator, or a keyword', () => {
	let render = tempura.compile("{{#if /`/.test(s)}}A{{#elif !/'/.test(s)}}B{{/if}}|{{#var r = typeof /`/}}{{ r }}|{{ [/'/, /'/].length }}", { props: ['s'] });
	assert.is(render({ s: '`' }), 'A|object|2');
	assert.is(render({ s: 'x' }), 'B|object|2');
});

compile('should read a slash after a value as division', () => {
	let render = tempura.compile("{{ a / b }}|{{ (a + 2) / b / 2 }}|{{ c[0] / b }}|{{ a++ / b }}|{{ '`' }}", { props: ['a', 'b', 'c'] });
	assert.is(render({ a: 4, b: 2, c: [6] }), '2|1.5|3|2|`');
});

compile('should call ".", "/", and one-character block names', () => {
	let render = tempura.compile('{{#a}}|{{#a.b}}|{{#a/b}}', {
		blocks: { a: () => 1, 'a.b': () => 2, 'a/b': () => 3 }
	});
	assert.is(render(), '1|2|3');
});

compile('should use blocks given at call time', () => {
	let render = tempura.compile('{{#show a=1}}', {
		blocks: { show: args => JSON.stringify(args) }
	});
	assert.is(render({}), '{"a":1}');
	assert.is(render({}, { show: () => 'other' }), 'other');
});

compile('should print backticks, backslashes, and "${" in text as they are', () => {
	let text = '<script>let a = `x`; let b = ${c}; /\\d+/;</script>';
	assert.is(tempura.compile(text)(), text);
	assert.is(tempura.compile(text + '{{ v }}', { props: ['v'] })({ v: '`' }), text + '`');
});

compile.run();

// ---

const whitespace = suite('whitespace');

whitespace('should keep line breaks between values', () => {
	let render = tempura.compile('{{ a }}\n{{ a }}\n\n{{{ a }}}', { props: ['a'] });
	assert.is(render({ a: 'x' }), 'x\nx\n\nx');
});

whitespace('should keep line breaks at the end', () => {
	assert.is(tempura.compile('a\n')(), 'a\n');
	assert.is(tempura.compile('a\n\n')(), 'a\n\n');
	assert.is(tempura.compile('{{ a }}\n', { props: ['a'] })({ a: 'x' }), 'x\n');
});

whitespace('should drop a block line, with its indent and line break', () => {
	let render = tempura.compile('<ul>\n  {{#each xs as x}}\n  <li>{{ x }}</li>\n  {{/each}}\n</ul>\n', { props: ['xs'] });
	assert.is(render({ xs: [1, 2] }), '<ul>\n  <li>1</li>\n  <li>2</li>\n</ul>\n');
});

whitespace('should drop #if, #elif, #else, and comment lines', () => {
	let render = tempura.compile('{{! note }}\n{{#if a}}\n\tA\n{{#elif b}}\n\tB\n{{#else}}\n\tC\n{{/if}}\nend', { props: ['a', 'b'] });
	assert.is(render({ a: true }), '\tA\nend');
	assert.is(render({ b: true }), '\tB\nend');
	assert.is(render({}), '\tC\nend');
});

whitespace('should drop #expect, #var, and custom block lines', () => {
	let render = tempura.compile('{{#expect a}}\n{{#var b = a + 1}}\n{{#show}}\n{{ b }}\n', { blocks: { show: () => '' } });
	assert.is(render({ a: 1 }), '2\n');
});

whitespace('should keep a block that shares its line', () => {
	let render = tempura.compile('<p>{{#if a}}yes{{/if}}</p>\n  {{#if a}}yes{{/if}}\n', { props: ['a'] });
	assert.is(render({ a: true }), '<p>yes</p>\n  yes\n');
});

whitespace('should keep a value line, even alone', () => {
	let render = tempura.compile('<p>\n  {{ a }}\n</p>', { props: ['a'] });
	assert.is(render({ a: 'x' }), '<p>\n  x\n</p>');
});

whitespace('should find block lines that end with CRLF', () => {
	let render = tempura.compile('a\r\n{{#if ok}}\r\nb\r\n{{/if}}\r\nc', { props: ['ok'] });
	assert.is(render({ ok: true }).replace(/\r/g, ''), 'a\nb\nc');
});

whitespace.run();

// ---

const esc = suite('esc');

esc('should be a function', () => {
	assert.type(tempura.esc, 'function');
});

esc('should convert non-string inputs to string', () => {
	assert.is(tempura.esc(), '');
	assert.is(tempura.esc(null), '');

	assert.is(tempura.esc(false), 'false');
	assert.is(tempura.esc(123), '123');
	assert.is(tempura.esc(0), '0');

	assert.equal(tempura.esc([1, 2, 3]), '1,2,3');
	assert.equal(tempura.esc({ foo: 1 }), '[object Object]');
});

esc('should prevent xss scripting in array', () => {
	let output = tempura.esc(['<img src=x onerror="alert(1)" />']);
	assert.is(output, '&lt;img src=x onerror=&quot;alert(1)&quot; />');
});

esc('should return string from string input', () => {
	assert.type(tempura.esc(''), 'string');
	assert.type(tempura.esc('foobar'), 'string');
});

esc('should escape `<` character', () => {
	assert.is(
		tempura.esc('here: <'),
		'here: &lt;'
	);
});

esc('should escape `"` character', () => {
	assert.is(
		tempura.esc('here: "'),
		'here: &quot;'
	);
});

esc("should escape `'` character", () => {
	assert.is(
		tempura.esc("here: '"),
		'here: &#39;'
	);
});

esc('should escape `&` character', () => {
	assert.is(
		tempura.esc('here: &'),
		'here: &amp;'
	);
});

esc('should escape all target characters in a string', () => {
	assert.is(
		tempura.esc('&&& <<< """'),
		'&amp;&amp;&amp; &lt;&lt;&lt; &quot;&quot;&quot;'
	);
});

esc('should reset state on same input string', () => {
	let input = '<foo>"hello"</foo>';

	assert.is(
		tempura.esc(input),
		'&lt;foo>&quot;hello&quot;&lt;/foo>'
	);

	assert.is(
		tempura.esc(input),
		'&lt;foo>&quot;hello&quot;&lt;/foo>',
		'~> repeat'
	);
});

esc.run();
