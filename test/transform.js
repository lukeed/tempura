import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { transform } from '../src';

// ---

const values = suite('{{ values }}');

values('{{ value }}', () => {
	assert.is(
		transform('{{ value }}'),
		'var x=`${$$1(value)}`;return x'
	);

	assert.is(
		transform('{{value }}'),
		'var x=`${$$1(value)}`;return x'
	);

	assert.is(
		transform('{{ value}}'),
		'var x=`${$$1(value)}`;return x'
	);

	assert.is(
		transform('{{value}}'),
		'var x=`${$$1(value)}`;return x'
	);
});

values('{{ foo.bar }}', () => {
	assert.is(
		transform('{{ foo.bar }}'),
		'var x=`${$$1(foo.bar)}`;return x'
	);
});

values('{{ foo["bar"] }}', () => {
	assert.is(
		transform('{{ foo["bar"] }}'),
		'var x=`${$$1(foo["bar"])}`;return x'
	);
});

values('<h1>{{ foo.bar }} ...</h1>', () => {
	assert.is(
		transform('<h1>{{ foo.bar }} <span>howdy</span></h1>'),
		'var x=`<h1>${$$1(foo.bar)} <span>howdy</span></h1>`;return x'
	);
});

values.run();

// ---

const raws = suite('{{{ raw }}}');

raws('{{ value }}', () => {
	assert.is(
		transform('{{{ value }}}'),
		'var x=`${value}`;return x'
	);

	assert.is(
		transform('{{{value }}}'),
		'var x=`${value}`;return x'
	);

	assert.is(
		transform('{{{ value}}}'),
		'var x=`${value}`;return x'
	);

	assert.is(
		transform('{{{value}}}'),
		'var x=`${value}`;return x'
	);
});

raws('{{{ foo.bar }}}', () => {
	assert.is(
		transform('{{{ foo.bar }}}'),
		'var x=`${foo.bar}`;return x'
	);
});

raws('{{{ foo["bar"] }}}', () => {
	assert.is(
		transform('{{{ foo["bar"] }}}'),
		'var x=`${foo["bar"]}`;return x'
	);
});

raws('<h1>{{{ foo.bar }}} ...</h1>', () => {
	assert.is(
		transform('<h1>{{{ foo.bar }}} <span>howdy</span></h1>'),
		'var x=`<h1>${foo.bar} <span>howdy</span></h1>`;return x'
	);
});

raws.run();

// ---

const expect = suite('expect');

expect('{{#expect foo,bar}}', () => {
	assert.is(
		transform('{{#expect foo,bar}}'),
		'var{foo,bar}=$$2,x="";return x'
	);

	assert.is(
		transform('{{#expect foo , bar}}'),
		'var{foo,bar}=$$2,x="";return x'
	);

	assert.is(
		transform('{{#expect\n\tfoo ,bar}}'),
		'var{foo,bar}=$$2,x="";return x'
	);
});

expect('{{#expect foobar}}', () => {
	assert.is(
		transform('{{#expect foobar}}'),
		'var{foobar}=$$2,x="";return x'
	);

	assert.is(
		transform('{{#expect \n  foobar\n}}'),
		'var{foobar}=$$2,x="";return x'
	);
});

expect.run();

// ---

const control = suite('control');

control('{{#if isActive}}...{{/if}}', () => {
	assert.is(
		transform('{{#if isActive}}<p>yes</p>{{/if}}'),
		'var x="";if(isActive){x+=`<p>yes</p>`;}return x'
	);
});

control('{{#if foo.bar}}...{{#else}}...{{/if}}', () => {
	assert.is(
		transform('{{#if foo.bar}}<p>yes</p>{{#else}}<p>no {{ way }}</p>{{/if}}'),
		'var x="";if(foo.bar){x+=`<p>yes</p>`;}else{x+=`<p>no ${$$1(way)}</p>`;}return x'
	);
});

control('{{#if foo == 0}}...{{#else}}...{{/if}}', () => {
	assert.is(
		transform('{{#if foo == 0}}<p>zero</p>{{#else}}<p>not zero</p>{{/if}}'),
		'var x="";if(foo == 0){x+=`<p>zero</p>`;}else{x+=`<p>not zero</p>`;}return x'
	);
});

control('{{#if isActive}}...{{#elif isMuted}}...{{#else}}...{{/if}}', () => {
	assert.is(
		transform('{{#if isActive}}<p>active</p>{{#elif isMuted}}<p>muted</p>{{#else}}<p>inactive</p>{{/if}}'),
		'var x="";if(isActive){x+=`<p>active</p>`;}else if(isMuted){x+=`<p>muted</p>`;}else{x+=`<p>inactive</p>`;}return x'
	);
});

control('{{#if isActive}}...{{#elif isMuted}}...{{/if}}', () => {
	assert.is(
		transform('{{#if isActive}}<p>active</p>{{#elif isMuted}}<p>muted</p>{{/if}}'),
		'var x="";if(isActive){x+=`<p>active</p>`;}else if(isMuted){x+=`<p>muted</p>`;}return x'
	);
});

control.run();

// ---

const vars = suite('vars');

vars('{{#var foo = "world" }}', () => {
	assert.is(
		transform('{{#var foo = "world"}}<p>hello {{ foo }}</p>'),
		'var x="";var foo="world";x+=`<p>hello ${$$1(foo)}</p>`;return x'
	);

	assert.is(
		transform('{{#var foo = "world";}}<p>hello {{ foo }}</p>'),
		'var x="";var foo="world";x+=`<p>hello ${$$1(foo)}</p>`;return x'
	);
});

vars('{{#var foo = 1+2 }}', () => {
	assert.is(
		transform('{{#var foo = 1+2}}<p>hello {{ foo }}</p>'),
		'var x="";var foo=1+2;x+=`<p>hello ${$$1(foo)}</p>`;return x'
	);

	assert.is(
		transform('{{#var foo = 1+2;}}<p>hello {{ foo }}</p>'),
		'var x="";var foo=1+2;x+=`<p>hello ${$$1(foo)}</p>`;return x'
	);
});

vars('{{#var foo = {...} }}', () => {
	assert.is(
		transform('{{#var name = { first: "luke" } }}<p>hello {{ name.first }}</p>'),
		'var x="";var name={ first: "luke" };x+=`<p>hello ${$$1(name.first)}</p>`;return x'
	);

	assert.is(
		transform('{{#var name = { first:"luke" }; }}<p>hello {{ name.first }}</p>'),
		'var x="";var name={ first:"luke" };x+=`<p>hello ${$$1(name.first)}</p>`;return x'
	);
});

vars('{{#var foo = [...] }}', () => {
	assert.is(
		transform('{{#var name = ["luke"] }}<p>hello {{ name[0] }}</p>'),
		'var x="";var name=["luke"];x+=`<p>hello ${$$1(name[0])}</p>`;return x'
	);

	assert.is(
		transform('{{#var name = ["luke"]; }}<p>hello {{ name[0] }}</p>'),
		'var x="";var name=["luke"];x+=`<p>hello ${$$1(name[0])}</p>`;return x'
	);

	assert.is(
		transform('{{#var name = ["luke"]; }}<p>hello {{{ name[0] }}}</p>'),
		'var x="";var name=["luke"];x+=`<p>hello ${name[0]}</p>`;return x'
	);
});

vars('{{#var foo = truthy(bar) }}', () => {
	assert.is(
		transform('{{#var foo = truthy(bar)}}{{#if foo != 0}}<p>yes</p>{{/if}}'),
		'var x="";var foo=truthy(bar);if(foo != 0){x+=`<p>yes</p>`;}return x'
	);

	assert.is(
		transform('{{#var foo = truthy(bar); }}{{#if foo != 0}}<p>yes</p>{{ /if }}'),
		'var x="";var foo=truthy(bar);if(foo != 0){x+=`<p>yes</p>`;}return x'
	);
});

vars.run();

// ---

const comments = suite('comments');

comments('{{! hello }}', () => {
	assert.is(
		transform('{{! hello }}'),
		'var x="";return x'
	);

	assert.is(
		transform('{{!hello}}'),
		'var x="";return x'
	);
});

comments('{{! "hello world" }}', () => {
	assert.is(
		transform('{{! "hello world" }}'),
		'var x="";return x'
	);

	assert.is(
		transform('{{!"hello world"}}'),
		'var x="";return x'
	);
});

comments.run();

// ---

const each = suite('each');

each('{{#each items}}...{{/each}}', () => {
	assert.is(
		transform('{{#each items}}<p>hello</p>{{/each}}'),
		'var x="";for(var i=0,$$a=items;i<$$a.length;i++){x+=`<p>hello</p>`;}return x'
	);
});

each('{{#each items as item}}...{{/each}}', () => {
	assert.is(
		transform('{{#each items as item}}<p>hello {{item.name}}</p>{{/each}}'),
		'var x="";for(var i=0,item,$$a=items;i<$$a.length;i++){item=$$a[i];x+=`<p>hello ${$$1(item.name)}</p>`;}return x'
	);

	assert.is(
		transform('{{#each items as (item) }}<p>hello {{item.name}}</p>{{/each}}'),
		'var x="";for(var i=0,item,$$a=items;i<$$a.length;i++){item=$$a[i];x+=`<p>hello ${$$1(item.name)}</p>`;}return x'
	);

	assert.is(
		transform('{{#each items as (item) }}<p>hello {{{item.name}}}</p>{{/each}}'),
		'var x="";for(var i=0,item,$$a=items;i<$$a.length;i++){item=$$a[i];x+=`<p>hello ${item.name}</p>`;}return x'
	);
});

each('{{#each items as (item,idx)}}...{{/each}}', () => {
	assert.is(
		transform('<ul>{{#each items as (item,idx)}}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${$$1(idx)})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		transform('<ul>{{#each items as (item, idx) }}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${$$1(idx)})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		transform('<ul>{{#each items as (item, idx) }}<li>hello {{item.name}} (#{{{ idx }}})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${idx})</li>`;}x+=`</ul>`;return x'
	);
});

each('{{#each items as item, idx}}...{{/each}}', () => {
	assert.is(
		transform('<ul>{{#each items as item,idx}}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${$$1(idx)})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		transform('<ul>{{#each items as item, idx }}<li>hello {{item.name}} (#{{ idx }})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${$$1(item.name)} (#${$$1(idx)})</li>`;}x+=`</ul>`;return x'
	);

	assert.is(
		transform('<ul>{{#each items as item, idx }}<li>hello {{{item.name}}} (#{{{ idx }}})</li>{{/each}}</ul>'),
		'var x=`<ul>`;for(var idx=0,item,$$a=items;idx<$$a.length;idx++){item=$$a[idx];x+=`<li>hello ${item.name} (#${idx})</li>`;}x+=`</ul>`;return x'
	);
});

each.run();

// ---

const unknown = suite('unknown');

unknown('should throw error on unknown directive', () => {
	try {
		transform('{{#include "name" src=true }}');
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error);
		assert.is(err.message, 'Unknown "include" block');
	}
});

unknown.run();
