const assert = require('uvu/assert');
const { Suite } = require('benchmark');

const RAW = require('./fixtures/raw');

console.log('Loading:\n---');

console.time('pug');
const pug = require('pug');
console.timeEnd('pug');

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

function runner(name, contenders, options={}) {
	if (options.assert) {
		console.log('\n(%s) Validation: ', name);
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

	console.log('\n(%s) Benchmark: ', name);
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

// ---

const compilers = {
	'pug': () => pug.compile(RAW.pug),
	'handlebars': () => handlebars.compile(RAW.hbs),
	'yeahjs': () => yeahjs.compile(RAW.ejs, { locals: ['list'] }),
	'dot': () => dot.template(RAW.dot),
	'art-template': () => art.compile(RAW.ejs),
	'tempura': () => tempura.compile(RAW.tempura),
};

// runner('compile', compilers, {
// 	assert(fn) {
// 		assert.type(fn(), 'function', '~> compiles a function');
// 	}
// });

const renders = {};
for (let k in compilers) {
	renders[k] = compilers[k]();
}

// // 37.7k
// renders['tempura'] = function (xyz) {
// 	var x="<ul>";for(var i=0,item,arr=xyz.list;i<arr.length;i++){item=arr[i];x+=`<li>User: ${item.user} / Web Site: ${item.site}</li>`;}x+='</ul>';return x;
// }

// // 44.5k
// renders['tempura'] = function (xyz) {
// 	var x="<ul>";for(var i=0,item,arr=xyz.list;i<arr.length;i++){item=arr[i];x+='<li>User: '+item.user+' / Web Site: '+item.site+'</li>';}x+='</ul>';return x;
// }

// // 44.1k
// renders['tempura'] = function (xyz) {
// 	var x="<ul>";for(var i=0,item;i<xyz.list.length;i++){item=xyz.list[i];x+='<li>User: '+item.user+' / Web Site: '+item.site+'</li>';}x+='</ul>';return x;
// }

// // 44.5k
// renders['tempura'] = function (xyz) {
// 	var {list}=xyz;
// 	var x="<ul>";for(var i=0,item;i<list.length;i++){item=list[i];x+='<li>User: '+item.user+' / Web Site: '+item.site+'</li>';}x+='</ul>';return x;
// }

// // 1.2k lol
// renders['tempura'] = function (xyz) {
// 	var x="<ul>";
// 	with (xyz) {
// 		for(var i=0,item;i<list.length;i++){item=list[i];x+='<li>User: '+item.user+' / Web Site: '+item.site+'</li>';}
// 	}
// 	x+='</ul>';
// 	return x;
// }

runner('render', renders, {
	setup() {
		let list = [];
		for (let i=0; i < 1e3; i++) {
			list.push({
				user: `user-${i}`,
				site: `https://github.com/user-${i}`,
			});
		}
		return { list };
	},
	assert(render) {
		let list = [
			{ user: 'lukeed', site: 'https://github.com/lukeed'},
			{ user: 'billy', site: 'https://github.com/billy'},
		];

		let output = render({ list });
		assert.type(output, 'string', '~> renders string');

		let normalize = output.replace(/\n/g, '').replace(/[\t ]+\</g, '<').replace(/\>[\t ]+\</g, '><').replace(/\>[\t ]+$/g, '>');
		assert.is(normalize, `<ul><li>User: lukeed / Web Site: https://github.com/lukeed</li><li>User: billy / Web Site: https://github.com/billy</li></ul>`);
	},
});
