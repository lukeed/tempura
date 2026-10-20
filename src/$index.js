const ESCAPE = /[&"'<]/g, CHARS = {
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;',
	'<': '&lt;',
};

import { gen } from './$utils';

export function esc(value) {
	value = (value == null) ? '' : '' + value;
	let last=ESCAPE.lastIndex=0, tmp=0, out='';
	while (ESCAPE.test(value)) {
		tmp = ESCAPE.lastIndex - 1;
		out += value.substring(last, tmp) + CHARS[value[tmp]];
		last = tmp + 1;
	}
	return out + value.substring(last);
}

export function compile(input, options={}) {
	let render = new (options.async ? (async()=>{}).constructor : Function)(
		'$$1', '$$2', '$$3', gen(input, options)
	);
	let escape = options.escape || esc;
	return options.async
		? async (data, blocks) => render(escape, blocks || options.blocks, data)
		: (data, blocks) => render(escape, blocks || options.blocks, data);
}

export function transform(input, options={}) {
	return (
		options.format === 'cjs'
		? 'var $$1=require("tempura").esc;module.exports='
		: 'import{esc as $$1}from"tempura";export default '
	) + (
		options.async ? 'async ' : ''
	) + 'function($$3,$$2){'+gen(input, options)+'}';
}
