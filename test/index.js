import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as tempura from '../src';

// ---

const transform = suite('transform');

transform('should be a function', () => {
	assert.type(tempura.transform, 'function');
});

transform('should return a string', () => {
	let output = tempura.transform('');
	assert.type(output, 'string');
});

transform('should include "esc" import via "tempura/utils" module', () => {
	let output = tempura.transform('');
	assert.match(output, /\{esc(\:| as )/);
	assert.match(output, '"tempura/utils"');
});

transform('format :: ESM (default)', () => {
	let output = tempura.transform('');
	assert.match(output, 'import{esc as $$1}from"tempura/utils";');
	assert.match(output, ';export default function($$2){');
	assert.ok(output.endsWith('}'), 'close function');
});

transform('format :: CommonJS', () => {
	let output = tempura.transform('', { format: 'cjs' });
	assert.match(output, 'var{esc:$$1}=require("tempura/utils");');
	assert.match(output, ';module.exports=function($$2){');
	assert.ok(output.endsWith('}'), 'close function');
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

compile.run();
