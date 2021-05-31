const { Suite } = require('benchmark');

exports.runner = function (name, contenders, options={}) {
	if (options.assert) {
		console.log('\nValidation (%s)', name);
		Object.keys(contenders).forEach(name => {
			try {
				options.assert(contenders[name]);
				console.log('  ✔', name);
			} catch (err) {
				console.log('  ✘', name, `(FAILED @ "${err.message}")`);
			}
		});
	}

	let value;
	if (options.setup) {
		value = options.setup();
	}

	console.log('\nBenchmark (%s)', name);
	const bench = new Suite().on('cycle', e => {
		console.log('  ' + e.target);
	});

	Object.keys(contenders).forEach(name => {
		bench.add(name + ' '.repeat(18 - name.length), () => {
			contenders[name](value);
		})
	});

	bench.run();
}
