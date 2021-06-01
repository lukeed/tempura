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
