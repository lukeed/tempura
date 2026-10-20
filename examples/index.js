import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compile } from '../dist/index.mjs';

const user = {
	firstname: 'Luke',
	lastname: 'Edwards',
	avatar: 'https://avatars.githubusercontent.com/u/5855893?v=4',
};

const examples = [
	'basic.hbs',
	'blocks.hbs',
];

// Define custom blocks
// ~> Shared w/ all examples
const blocks = {
	h1(args) {
		return `<h1 class="title">${args.text}</h1>`;
	},
	include(args) {
		let { src, ...rest } = args;
		let render = Cache[src] || compile(
			readFileSync(file, 'utf8'),
			{ blocks }
		);
		return render(rest);
	},
};

const Cache = {};

for (let name of examples) {
	let render = Cache[name];

	if (!render) {
		let file = join(import.meta.dirname, name);
		let data = await readFile(file, 'utf8');
		render = Cache[name] = compile(data, { blocks });
	}
	console.log('\n\n>>>', name);
	console.log(render(user));
}
