import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { gen } from '../../src/utils';

const API = suite('API');

API('should be a function', () => {
	assert.type(gen, 'function');
});

API('should return a string', () => {
	assert.type(gen(''), 'string');
});

API('should throw if no input', () => {
	assert.throws(gen);
});

API.run();

// ---

const values = suite('{{ values }}');

values('{{ value }}', () => {
	assert.is(
		gen('{{ value }}'),
		'var x=`${$$1(value)}`;return x'
	);

	assert.is(
		gen('{{value }}'),
		'var x=`${$$1(value)}`;return x'
	);

	assert.is(
		gen('{{ value}}'),
		'var x=`${$$1(value)}`;return x'
	);

	assert.is(
		gen('{{value}}'),
		'var x=`${$$1(value)}`;return x'
	);
});

values('{{ foo.bar }}', () => {
	assert.is(
		gen('{{ foo.bar }}'),
		'var x=`${$$1(foo.bar)}`;return x'
	);
});

values('{{ foo["bar"] }}', () => {
	assert.is(
		gen('{{ foo["bar"] }}'),
		'var x=`${$$1(foo["bar"])}`;return x'
	);
});

values('<h1>{{ foo.bar }} ...</h1>', () => {
	assert.is(
		gen('<h1>{{ foo.bar }} <span>howdy</span></h1>'),
		'var x=`<h1>${$$1(foo.bar)} <span>howdy</span></h1>`;return x'
	);
});

values.run();

// ---

const raws = suite('{{{ raw }}}');

raws('{{ value }}', () => {
	assert.is(
		gen('{{{ value }}}'),
		'var x=`${value}`;return x'
	);

	assert.is(
		gen('{{{value }}}'),
		'var x=`${value}`;return x'
	);

	assert.is(
		gen('{{{ value}}}'),
		'var x=`${value}`;return x'
	);

	assert.is(
		gen('{{{value}}}'),
		'var x=`${value}`;return x'
	);
});

raws('{{{ foo.bar }}}', () => {
	assert.is(
		gen('{{{ foo.bar }}}'),
		'var x=`${foo.bar}`;return x'
	);
});

raws('{{{ foo["bar"] }}}', () => {
	assert.is(
		gen('{{{ foo["bar"] }}}'),
		'var x=`${foo["bar"]}`;return x'
	);
});

raws('<h1>{{{ foo.bar }}} ...</h1>', () => {
	assert.is(
		gen('<h1>{{{ foo.bar }}} <span>howdy</span></h1>'),
		'var x=`<h1>${foo.bar} <span>howdy</span></h1>`;return x'
	);
});

raws.run();

// ---

const expect = suite('#expect');

expect('{{#expect foo,bar}}', () => {
	assert.is(
		gen('{{#expect foo,bar}}'),
		'var{foo,bar}=$$3,x="";return x'
	);

	assert.is(
		gen('{{#expect foo , bar}}'),
		'var{foo,bar}=$$3,x="";return x'
	);

	assert.is(
		gen('{{#expect\n\tfoo ,bar}}'),
		'var{foo,bar}=$$3,x="";return x'
	);
});

expect('{{#expect foobar}}', () => {
	assert.is(
		gen('{{#expect foobar}}'),
		'var{foobar}=$$3,x="";return x'
	);

	assert.is(
		gen('{{#expect \n  foobar\n}}'),
		'var{foobar}=$$3,x="";return x'
	);
});

expect.run();

// ---

const control = suite('#if');

control('{{#if isActive}}...{{/if}}', () => {
	assert.is(
		gen('{{#if isActive}}<p>yes</p>{{/if}}'),
		'var x="";if(isActive){x+=`<p>yes</p>`;}return x'
	);
});

control('{{#if foo.bar}}...{{#else}}...{{/if}}', () => {
	assert.is(
		gen('{{#if foo.bar}}<p>yes</p>{{#else}}<p>no {{ way }}</p>{{/if}}'),
		'var x="";if(foo.bar){x+=`<p>yes</p>`;}else{x+=`<p>no ${$$1(way)}</p>`;}return x'
	);
});

control('{{#if foo == 0}}...{{#else}}...{{/if}}', () => {
	assert.is(
		gen('{{#if foo == 0}}<p>zero</p>{{#else}}<p>not zero</p>{{/if}}'),
		'var x="";if(foo == 0){x+=`<p>zero</p>`;}else{x+=`<p>not zero</p>`;}return x'
	);
});

control('{{#if isActive}}...{{#elif isMuted}}...{{#else}}...{{/if}}', () => {
	assert.is(
		gen('{{#if isActive}}<p>active</p>{{#elif isMuted}}<p>muted</p>{{#else}}<p>inactive</p>{{/if}}'),
		'var x="";if(isActive){x+=`<p>active</p>`;}else if(isMuted){x+=`<p>muted</p>`;}else{x+=`<p>inactive</p>`;}return x'
	);
});

control('{{#if isActive}}...{{#elif isMuted}}...{{/if}}', () => {
	assert.is(
		gen('{{#if isActive}}<p>active</p>{{#elif isMuted}}<p>muted</p>{{/if}}'),
		'var x="";if(isActive){x+=`<p>active</p>`;}else if(isMuted){x+=`<p>muted</p>`;}return x'
	);
});

control.run();

// ---

const vars = suite('#vars');

vars('{{#var foo = "world" }}', () => {
	assert.is(
		gen('{{#var foo = "world"}}<p>hello {{ foo }}</p>'),
		'var x="";var foo="world";x+=`<p>hello ${$$1(foo)}</p>`;return x'
	);

	assert.is(
		gen('{{#var foo = "world";}}<p>hello {{ foo }}</p>'),
		'var x="";var foo="world";x+=`<p>hello ${$$1(foo)}</p>`;return x'
	);
});

vars('{{#var foo = 1+2 }}', () => {
	assert.is(
		gen('{{#var foo = 1+2}}<p>hello {{ foo }}</p>'),
		'var x="";var foo=1+2;x+=`<p>hello ${$$1(foo)}</p>`;return x'
	);

	assert.is(
		gen('{{#var foo = 1+2;}}<p>hello {{ foo }}</p>'),
		'var x="";var foo=1+2;x+=`<p>hello ${$$1(foo)}</p>`;return x'
	);
});

vars('{{#var foo = {...} }}', () => {
	assert.is(
		gen('{{#var name = { first: "luke" } }}<p>hello {{ name.first }}</p>'),
		'var x="";var name={ first: "luke" };x+=`<p>hello ${$$1(name.first)}</p>`;return x'
	);

	assert.is(
		gen('{{#var name = { first:"luke" }; }}<p>hello {{ name.first }}</p>'),
		'var x="";var name={ first:"luke" };x+=`<p>hello ${$$1(name.first)}</p>`;return x'
	);
});

vars('{{#var foo = [...] }}', () => {
	assert.is(
		gen('{{#var name = ["luke"] }}<p>hello {{ name[0] }}</p>'),
		'var x="";var name=["luke"];x+=`<p>hello ${$$1(name[0])}</p>`;return x'
	);

	assert.is(
		gen('{{#var name = ["luke"]; }}<p>hello {{ name[0] }}</p>'),
		'var x="";var name=["luke"];x+=`<p>hello ${$$1(name[0])}</p>`;return x'
	);

	assert.is(
		gen('{{#var name = ["luke"]; }}<p>hello {{{ name[0] }}}</p>'),
		'var x="";var name=["luke"];x+=`<p>hello ${name[0]}</p>`;return x'
	);
});

vars('{{#var foo = truthy(bar) }}', () => {
	assert.is(
		gen('{{#var foo = truthy(bar)}}{{#if foo != 0}}<p>yes</p>{{/if}}'),
		'var x="";var foo=truthy(bar);if(foo != 0){x+=`<p>yes</p>`;}return x'
	);

	assert.is(
		gen('{{#var foo = truthy(bar); }}{{#if foo != 0}}<p>yes</p>{{ /if }}'),
		'var x="";var foo=truthy(bar);if(foo != 0){x+=`<p>yes</p>`;}return x'
	);
});

vars.run();

// ---

const comments = suite('!comments');

comments('{{! hello }}', () => {
	assert.is(
		gen('{{! hello }}'),
		'var x="";return x'
	);

	assert.is(
		gen('{{!hello}}'),
		'var x="";return x'
	);
});

comments('{{! "hello world" }}', () => {
	assert.is(
		gen('{{! "hello world" }}'),
		'var x="";return x'
	);

	assert.is(
		gen('{{!"hello world"}}'),
		'var x="";return x'
	);
});

comments.run();

// ---

const each = suite('#each');

each('{{#each items}}...{{/each}}', () => {
	assert.is(
		gen('{{#each items}}<p>hello</p>{{/each}}'),
		'var x="";for(var i=0,$$a=items;i<$$a.length;i++){x+=`<p>hello</p>`;}return x'
	);
});

each('{{#each items as item}}...{{/each}}', () => {
	assert.is(
		gen('{{#each items as item}}<p>hello {{item.name}}</p>{{/each}}'),
		'var x="";for(var i=0,item,$$a=items;i<$$a.length;i++){item=$$a[i];x+=`<p>hello ${$$1(item.name)}</p>`;}return x'
	);

	assert.is(
		gen('{{#each items as (item) }}<p>hello {{item.name}}</p>{{/each}}'),
		'var x="";for(var i=0,item,$$a=items;i<$$a.length;i++){item=$$a[i];x+=`<p>hello ${$$1(item.name)}</p>`;}return x'
	);

	assert.is(
		gen('{{#each items as (item) }}<p>hello {{{item.name}}}</p>{{/each}}'),
		'var x="";for(var i=0,item,$$a=items;i<$$a.length;i++){item=$$a[i];x+=`<p>hello ${item.name}</p>`;}return x'
	);
});

each('{{#each items as (item,idx)}}...{{/each}}', () => {
	assert.is(
		gen('<ul>{{#each items as (item,idx)}}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${$$1(idx)})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		gen('<ul>{{#each items as (item, idx) }}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${$$1(idx)})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		gen('<ul>{{#each items as (item, idx) }}<li>hello {{item.name}} (#{{{ idx }}})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${idx})</li>`;}x+=`</ul>`;return x'
	);
});

each('{{#each items as item, idx}}...{{/each}}', () => {
	assert.is(
		gen('<ul>{{#each items as item,idx}}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${$$1(idx)})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		gen('<ul>{{#each items as item, idx }}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${$$1(idx)})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		gen('<ul>{{#each items as item, idx }}<li>hello {{{item.name}}} (#{{{ idx }}})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${item.name} (#${idx})</li>`;}x+=`</ul>`;return x'
	);
});

each.run();

// ---

const blocks = suite('options.blocks');

blocks('should throw error on unknown directive', () => {
	try {
		gen('{{#include "name" src=true }}');
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, 'Unknown "include" block');
	}
});

blocks('should allow custom directives', () => {
	let ran = false;
	let tmpl = '{{#include "name" src=true }}';

	let output = gen(tmpl, {
		blocks: {
			include(inner, full) {
				ran = true;
				assert.is(full, tmpl);
				assert.is(inner, '"name" src=true');
				return 'replacement;';
			}
		}
	});

	assert.is(ran, true);
	assert.type(output, 'string');
	assert.is(output, 'var x="";replacement;return x');
});

blocks('should ensure ";" after replacement', () => {
	let output = gen('{{#foo}}', {
		blocks: {
			foo() {
				return 'bar';
			}
		}
	});

	assert.is(output, 'var x="";bar;return x');
});

blocks('should omit block if no replacement', () => {
	let output = gen('{{#var foo = 123}}{{#bar}}{{#baz}}{{#bat}}{{{ foo }}}', {
		blocks: {
			bar: () => '',
			baz: () => false,
			bat: () => 0,
		}
	});

	assert.is(output, 'var x="";var foo=123;x+=`${foo}`;return x');
});

blocks('should still throw on unknown block', () => {
	try {
		gen('{{#var foo = 123}}{{#bar}}{{#howdy}}{{{ foo }}}', {
			blocks: {
				bar: () => 'bar'
			}
		});
		assert.unreachable();
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, 'Unknown "howdy" block');
	}
});

blocks.run();

// ---

const stack = suite('stack');

stack('should throw on incorrect block order :: if->each', () => {
	try {
		gen(`
			{{#expect items}}
			{{#if items.length > 0}}
				{{#each items as item}}
					<p>{{{ item.name }}}</p>
			{{/if}}
		`);
		assert.unreachable();
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, `Expected to close "each" block; closed "if" instead`);
	}
});

stack('should throw on incorrect block order :: each->if', () => {
	try {
		gen(`
			{{#each items as item}}
				{{#if items.length > 0}}
					<p>{{{ item.name }}}</p>
			{{/each}}
		`);
		assert.unreachable();
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, `Expected to close "if" block; closed "each" instead`);
	}
});

stack('unterminated #if block', () => {
	try {
		gen(`
			{{#if items.length > 0}}
				<p>{{{ item.name }}}</p>
		`);
		assert.unreachable();
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, `Unterminated "if" block`);
	}
});

stack('unterminated #if->#elif block', () => {
	try {
		gen(`
			{{#if items.length === 1}}
				<p>{{{ item.name }}}</p>
			{{#elif items.length === 2}}
				<p>has two items</p>
		`);
		assert.unreachable();
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, `Unterminated "if" block`);
	}
});

stack('unterminated #each block', () => {
	try {
		gen(`
			{{#each items as item}}
				<p>{{{ item.name }}}</p>
		`);
		assert.unreachable();
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, `Unterminated "each" block`);
	}
});

stack.run();
