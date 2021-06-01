import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as utils from '../src/utils';
import * as tempura from '../src';

// ---

const API = suite('exports');

API('tempura', () => {
	assert.type(tempura.compile, 'function');
	assert.type(tempura.transform, 'function');
});

API('tempura/utils', () => {
	assert.type(utils.gen, 'function');
	assert.type(utils.esc, 'function');
});

API.run();
