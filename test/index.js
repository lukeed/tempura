import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { compile, transform } from '../src';

const API = suite('exports');

API('exports', () => {
	assert.type(compile, 'function');
	assert.type(transform, 'function');
});

API.run();
