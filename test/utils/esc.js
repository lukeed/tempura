import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { esc } from '../../src/utils';

const API = suite('API');

API('should be a function', () => {
	assert.type(esc, 'function');
});

API('should echo non-string inputs', () => {
	// @ts-ignore
	assert.is(esc(), undefined);
	assert.is(esc(null), null);
	assert.is(esc(false), false);
	assert.is(esc(123), 123);
	assert.is(esc(0), 0);

	assert.equal(esc([1, 2, 3]), [1, 2, 3]);
	assert.equal(esc({ foo: 1 }), { foo: 1 });
});

API('should return string from string input', () => {
	assert.type(esc(''), 'string');
	assert.type(esc('foobar'), 'string');
});

API.run();

// ---

const chars = suite('chars')


chars('should escape `<` character', () => {
	assert.is(
		esc('here: <'),
		'here: &lt'
	);
});

chars('should escape `"` character', () => {
	assert.is(
		esc('here: "'),
		'here: &quot;'
	);
});

chars('should escape `&` character', () => {
	assert.is(
		esc('here: &'),
		'here: &amp;'
	);
});

chars('should escape all target characters in a string', () => {
	assert.is(
		esc('&&& <<< """'),
		'&amp;&amp;&amp; &lt&lt&lt &quot;&quot;&quot;'
	);
});

chars('should reset state on same input string', () => {
	let input = '<foo>"hello"</foo>';

	assert.is(
		esc(input),
		'&ltfoo>&quot;hello&quot;&lt/foo>'
	);

	assert.is(
		esc(input),
		'&ltfoo>&quot;hello&quot;&lt/foo>',
		'~> repeat'
	);
});

chars.run();
