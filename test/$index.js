import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as tempura from '../src/$index';

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

transform('format :: ESM (default)', () => {
	let output = tempura.transform('');
	assert.match(output, 'import{esc as $$1}from"tempura";');
	assert.match(output, ';export default function($$3,$$2){');
	assert.ok(output.endsWith('}'), 'close function');
});

transform('format :: ESM :: async', () => {
	let output = tempura.transform('', { async: true });
	assert.match(output, ';export default async function($$3,$$2){');
});

transform('format :: CommonJS', () => {
	let output = tempura.transform('', { format: 'cjs' });
	assert.match(output, 'var $$1=require("tempura").esc;');
	assert.match(output, ';module.exports=function($$3,$$2){');
	assert.ok(output.endsWith('}'), 'close function');
});

transform('format :: CommonJS :: async', () => {
	let output = tempura.transform('', { format: 'cjs', async: true });
	assert.match(output, ';module.exports=async function($$3,$$2){');
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
		'"&ltb>howdy&lt/b>" is more than 10 characters'
	);

	assert.is(
		output({ value: '<b>aaa</b>' }).replace(/[\r\n\t]+/g, ''),
		'"&ltb>aaa&lt/b>" is too short'
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

compile.run();

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
	assert.is(output, '&ltimg src=x onerror=&quot;alert(1)&quot; />');
});

esc('should return string from string input', () => {
	assert.type(tempura.esc(''), 'string');
	assert.type(tempura.esc('foobar'), 'string');
});

esc('should escape `<` character', () => {
	assert.is(
		tempura.esc('here: <'),
		'here: &lt'
	);
});

esc('should escape `"` character', () => {
	assert.is(
		tempura.esc('here: "'),
		'here: &quot;'
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
		'&amp;&amp;&amp; &lt&lt&lt &quot;&quot;&quot;'
	);
});

esc('should reset state on same input string', () => {
	let input = '<foo>"hello"</foo>';

	assert.is(
		tempura.esc(input),
		'&ltfoo>&quot;hello&quot;&lt/foo>'
	);

	assert.is(
		tempura.esc(input),
		'&ltfoo>&quot;hello&quot;&lt/foo>',
		'~> repeat'
	);
});

esc.run();
