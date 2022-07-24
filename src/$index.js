import { gen } from './$utils';

export function esc(value) {
	value = (value == null) ? '' : '' + value;

	let idx = 0, len = value.length, char = 0, last = 0, out = '';

	for (; idx < len; idx++) {
		char = value.charCodeAt(idx);

		// <  60
		// &  38
		// "  34
		// '  39

		if (char === 60 || char === 38 || char === 34 || char === 39) {
			out += value.substring(last, idx) + ('&#' + char + ';');
			last = char + 1;
		}
	}

	return out + value.substring(last);
}

export function compile(input, options={}) {
	return new (options.async ? (async()=>{}).constructor : Function)(
		'$$1', '$$2', '$$3', gen(input, options)
	).bind(0, options.escape || esc, options.blocks);
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
