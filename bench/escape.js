const assert = require('uvu/assert');
const { runner } = require('./util');

console.log('Loading:\n---');

console.time('pug');
const pug = require('pug');
console.timeEnd('pug');

console.time('ejs');
const ejs = require('ejs');
console.timeEnd('ejs');

console.time('handlebars');
const handlebars = require('handlebars');
console.timeEnd('handlebars');

console.time('yeahjs');
const yeahjs = require('yeahjs');
console.timeEnd('yeahjs');

console.time('dot');
const dot = require('dot');
console.timeEnd('dot');

console.time('art-template');
const art = require('art-template');
console.timeEnd('art-template');

console.time('tempura');
const tempura = require('tempura');
console.timeEnd('tempura');

// ---

const compilers = {
	'pug': () => pug.compile(`ul\n\t-for (var i = 0, l = list.length; i < l; i ++) {\n\t\tli User: #{list[i].user} / Web Site: #{list[i].site}\n\t-}`),

	'handlebars': () => handlebars.compile(`
		<ul>
			{{#list}}
				<li>User: {{user}} / Web Site: {{site}}</li>
			{{/list}}
		</ul>
	`),

	'ejs': () => ejs.compile(`
		<ul>
			<% for (var i = 0, l = list.length; i < l; i ++) { %>
				<li>User: <%= list[i].user %> / Web Site: <%= list[i].site %></li>
			<% } %>
		</ul>
	`),

	'yeahjs': () => yeahjs.compile(`
		<ul>
			<% for (var i = 0, l = list.length; i < l; i ++) { %>
				<li>User: <%= list[i].user %> / Web Site: <%= list[i].site %></li>
			<% } %>
		</ul>
	`, { locals: ['list'] }),

	'dot': () => dot.template(`
		<ul>
			{{ for (var i = 0, l = it.list.length; i < l; i ++) { }}
				<li>User: {{!it.list[i].user}} / Web Site: {{!it.list[i].site}}</li>
			{{ } }}
		</ul>
	`),

	'art-template': () => art.compile(`
		<ul>
			<% for (var i = 0, l = list.length; i < l; i ++) { %>
				<li>User: <%= list[i].user %> / Web Site: <%= list[i].site %></li>
			<% } %>
		</ul>
	`),

	'tempura': () => tempura.compile(`
		{{#expect list}}
		<ul>
			{{#each list as item}}
				<li>User: {{ item.user }} / Web Site: {{ item.site }}</li>
			{{/each}}
		</ul>
	`, {
		format: 'cjs'
	}),
};

// runner('Compile', compilers, {
// 	assert(fn) {
// 		assert.type(fn(), 'function');
// 	}
// });

const renders = {};
console.log('\nBenchmark (Compile)');

for (let k in compilers) {
	let i=0, sum=0, max=5;
	while (i++ < max) {
		let n = process.hrtime();
		renders[k] = compilers[k]();
		let [, ns] = process.hrtime(n);
		sum += ns;
	}
	let avgms = (sum / max / 1e6).toFixed(5);
	console.log('  ~>', k.padEnd(18), avgms + 'ms');
}

runner('Render', renders, {
	setup() {
		let list = [];
		for (let i=0; i < 1e3; i++) {
			list.push({
				user: `<b>user-${i}</b>`,
				site: `"https://github.com/user-${i}""`,
			});
		}
		return { list };
	},
	assert(render) {
		let list = [
			{ user: '<b>lukeed</b>', site: '"https://github.com/lukeed"'},
			{ user: '<b>billy</b>', site: '"https://github.com/billy"'},
		];

		let output = render({ list });
		assert.type(output, 'string', '~> renders string');

		let normalize = output.replace(/\n/g, '').replace(/[\t ]+\</g, '<').replace(/\>[\t ]+\</g, '><').replace(/\>[\t ]+$/g, '>');
		assert.is.not(normalize, `<ul><li>User: <b>lukeed</b> / Web Site: "https://github.com/lukeed"</li><li>User: <b>billy</b> / Web Site: "https://github.com/billy"</li></ul>`);
	},
});
