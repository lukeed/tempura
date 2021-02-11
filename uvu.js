const { suite } = require('uvu');
const assert = require('uvu/assert');

function describe(name, fn) {
  const grp = suite(name);
	fn(grp); grp.run();
}

describe('thing', it => {
  it('1 + 2 = 3', () => {
		assert.is(1 + 2, 3);
	});
});

describe('outer', () => {
	describe('inner #1', it => {
		it('should run', () => {
			assert.is(1, 1);
		});
	});

	describe('inner #2', it => {
		it('should also run', () => {
			assert.is(1, 1);
		});
	});
});
