import { gen } from './utils.js';

import type { Args, Blocks, Options } from './types/index.d.ts';

type Render = (escape: typeof esc, blocks: Blocks | undefined, data: Args | undefined) => Promise<string> | string;

const ESCAPE = /[&"'<]/g;
const CHARS: Record<string, string> = {
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;',
	'<': '&lt;',
};

// `new Function` and `new AsyncFunction` give back an untyped function
const AsyncFunction = (async () => {}).constructor as FunctionConstructor;

/**
 * Escape `&`, `"`, `'`, and `<` in a value for HTML; `null` and `undefined` become `""`.
 * @example esc('<b>"hi"</b>') //=> '&lt;b>&quot;hi&quot;&lt;/b>'
 */
export function esc(value: unknown): string {
	let text = (value == null) ? '' : '' + value;
	let last=ESCAPE.lastIndex=0, tmp=0, out='';
	while (ESCAPE.test(text)) {
		tmp = ESCAPE.lastIndex - 1;
		out += text.substring(last, tmp) + CHARS[text[tmp]];
		last = tmp + 1;
	}
	return out + text.substring(last);
}

/**
 * Compile a template into a function that renders it.
 * @example compile('<p>{{ name }}</p>', { props: ['name'] })({ name: 'Luke' }) //=> '<p>Luke</p>'
 */
export function compile(input: string, options: Options & { escape?: typeof esc } = {}): (data?: Args, blocks?: Blocks) => Promise<string> | string {
	let render = new (options.async ? AsyncFunction : Function)(
		'$$1', '$$2', '$$3', gen(input, options)
	) as Render;
	let escape = options.escape || esc;
	return options.async
		? async (data, blocks) => render(escape, blocks || options.blocks, data)
		: (data, blocks) => render(escape, blocks || options.blocks, data);
}

/**
 * Transform a template into the source of an ES Module whose default export renders it.
 * @example transform('<p>{{ name }}</p>') //=> 'import{esc as $$1}from"tempura";export default function($$3,$$2){…}'
 */
export function transform(input: string, options: Options = {}): string {
	return 'import{esc as $$1}from"tempura";export default ' + (
		options.async ? 'async ' : ''
	) + 'function($$3,$$2){'+gen(input, options)+'}';
}
