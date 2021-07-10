const { join } = require('path');
const fs = require('fs/promises');

(async function () {
	const src = join(__dirname, '../src');

	let [$utils, $index] = await Promise.all([
		fs.readFile(join(src, '$utils.js'), 'utf8'),
		fs.readFile(join(src, '$index.js'), 'utf8'),
	]);

	$utils = $utils.replace('export function', 'function');
	$index = $index.replace(/import.*(?:\n)/, $utils);

	console.log('~> creating "src/index.js" placeholder');
	await fs.writeFile(join(src, 'index.js'), $index);
})().catch(err => {
	console.error('Oops', err.stack);
	process.exitCode = 1;
});
