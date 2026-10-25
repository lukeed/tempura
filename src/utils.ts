import type { Options } from './types/index.d.ts';

const VAR = /(?:^|[-*+^|%/&=\s])([a-zA-Z$_][\w$]*)(?:(?=$|[-*+^|%/&=\s]))/g;
const NAME = /[a-zA-Z$_][^\s=]*/y;
const IDENT = /^[a-zA-Z$_][\w$]*$/;
const KEYWORDS = /^(?:await|delete|false|in|instanceof|new|null|this|true|typeof|undefined|void|yield)$/;
const LITERAL = /[\\`]|\$\{/g;
const EACH = /\sas[\s(]/;
const OPEN = 123, CLOSE = 125, BACKSLASH = 92, SLASH = 47;
const OPERAND = /(?:^|[-(,=:[!&|?{;~^<>*%+]|#\s*[\w./]+\s|(?:^|[^\w$.])(?:await|case|delete|do|else|in|instanceof|new|of|return|typeof|void|yield))\s*$/;
const STEP = /(?:\+\+|--)\s*$/;

type Tag = { index: number; raw: boolean; text: string; inner: string };

function blank(code: number): boolean {
	return code === 32 || code === 9;
}

// A block or comment tag alone on its line takes the whole line: its indent, the tag, and its line break.
function line(src: string, last: number, from: number, to: number): [number, number] {
	let start = from, end = to;
	while (start > last && blank(src.charCodeAt(start - 1))) start--;
	while (end < src.length && blank(src.charCodeAt(end))) end++;
	if (start > 0 && src.charCodeAt(start - 1) !== 10) return [from, to];
	if (src.charCodeAt(end) === 13) end++;
	if (end < src.length && src.charCodeAt(end) !== 10) return [from, to];
	return [start, Math.min(end + 1, src.length)];
}

function name(code: number, more: boolean): boolean {
	return (code >= 97 && code <= 122) || (code >= 65 && code <= 90) || (code >= 48 && code <= 57) || code === 95 || (more && (code === 46 || code === 47));
}

function space(char: string | undefined): boolean {
	return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

function quoted(code: number): boolean {
	return code === 34 || code === 39 || code === 96;
}

function quote(src: string, i: number): number {
	for (let q = src.charCodeAt(i++), code; i < src.length; i++) {
		code = src.charCodeAt(i);
		if (code === BACKSLASH) i++;
		else if (code === q) return i + 1;
	}
	return -1;
}

// The end of the regex literal at `i`, or -1 when the slash there is division.
function regex(src: string, from: number, i: number): number {
	let before = src.substring(from, i);
	if (!OPERAND.test(before) || STEP.test(before)) return -1;
	for (let k = i + 1, set = false, code; k < src.length; k++) {
		code = src.charCodeAt(k);
		if (code === BACKSLASH) k++;
		else if (code === 10) return -1;
		else if (code === 91) set = true;
		else if (code === 93) set = false;
		else if (code === SLASH && !set) {
			while (name(src.charCodeAt(k + 1), false)) k++;
			return k + 1;
		}
	}
	return -1;
}

// The next {{ … }} or {{{ … }}} from `from`; it closes outside quotes, regexes, and nested braces, except in a {{! comment }}.
function tag(src: string, from: number): Tag | undefined {
	let index = src.indexOf('{{', from);
	if (index === -1) return;
	let raw = src.charCodeAt(index + 2) === OPEN;
	let start = index + (raw ? 3 : 2);
	let at = start;
	while (space(src[at])) at++;
	let note = src[at] === '!';
	for (let i = start, depth = 0, code; i < src.length; i++) {
		code = src.charCodeAt(i);
		if (!note && quoted(code)) {
			let next = quote(src, i);
			if (next !== -1) i = next - 1;
		} else if (!note && code === SLASH && i !== at) {
			let next = regex(src, start, i);
			if (next !== -1) i = next - 1;
		} else if (!note && code === OPEN) {
			depth++;
		} else if (code !== CLOSE) {
			continue;
		} else if (!note && depth > 0) {
			depth--;
		} else if (src.charCodeAt(i + 1) === CLOSE && (!raw || src.charCodeAt(i + 2) === CLOSE)) {
			return { index, raw, text: src.substring(index, i + (raw ? 3 : 2)), inner: src.substring(start, i) };
		}
	}
}

function group(src: string, i: number): number {
	for (let depth = 0, from = i; i < src.length; i++) {
		let char = src[i];
		if (char === '"' || char === "'" || char === '`') {
			i = quote(src, i) - 1;
			if (i < 0) return -1;
		} else if (char === '/') {
			let next = regex(src, from, i);
			if (next !== -1) i = next - 1;
		} else if (char === '(' || char === '{' || char === '[') {
			depth++;
		} else if ((char === ')' || char === '}' || char === ']') && --depth === 0) {
			return i + 1;
		}
	}
	return -1;
}

// `a="x" b=1 c=(x === y)` -> ['a:"x"', 'b:1', 'c:(x === y)']
function args(action: string, src: string): string[] {
	let out: string[] = [], i = 0, start = 0, name: RegExpExecArray | null, end: number, char: string | undefined;
	for (;;) {
		while (space(src[i])) i++;
		if (i >= src.length) return out;
		start = i;
		NAME.lastIndex = i;
		name = NAME.exec(src);
		if (!name) break;
		i = NAME.lastIndex;
		while (space(src[i])) i++;
		if (src[i++] !== '=') break;
		while (space(src[i])) i++;
		char = src[i];
		if (char === '"' || char === "'" || char === '`') end = quote(src, i);
		else if (char === '(' || char === '{' || char === '[') end = group(src, i);
		else for (end = i; end < src.length && !space(src[end]);) end++;
		if (end <= i) break;
		out.push(name[0] + ':' + src.substring(i, end));
		i = end;
	}
	throw new Error(`Cannot read the arguments of "${action}": ${JSON.stringify(src.substring(start).trim())}`);
}

// $$1 = escape()
// $$2 = extra blocks
// $$3 = template values
/**
 * Generate the body of a template function from its source.
 * @example new Function('$$1', '$$2', '$$3', gen('<p>{{ name }}</p>', { props: ['name'] }))
 */
export function gen(input: string, options: Options = {}): string {
	let char: string, num: number, action: string, chunk: string;
	let last = 0;
	let wip='', txt='', match: Tag | undefined, inner: string;

	let extra=options.blocks||{}, stack: string[]=[], ended=new Set<number>();
	let initials = new Set(options.props||[]);
	let literal = input.includes('`') || input.includes('\\') || input.includes('${');

	function close() {
		if (wip.length > 0) {
			txt += (txt ? '$$x+=' : '=') + '`' + wip + '`;';
		} else if (txt.length === 0) {
			txt = '="";'
		}
		wip = '';
	}

	while (match = tag(input, last)) {
		inner = match.inner.trim();
		char = inner.charAt(0);

		let [from, to] = (char === '#' || char === '/' || char === '!')
			? line(input, last, match.index, match.index + match.text.length)
			: [match.index, match.index + match.text.length];
		chunk = input.substring(last, from);
		wip += literal ? chunk.replace(LITERAL, '\\$&') : chunk;
		last = to;

		if (char === '!') {
			// comment, continue
		} else if (char === '#') {
			close();
			let end: number;
			for (num = 1; space(inner[num]);) num++;
			for (end = num; end < inner.length && name(inner.charCodeAt(end), end > num);) end++;
			if (end === num) throw new Error(`Cannot read the name of block: ${JSON.stringify(match.text)}`);
			action = inner.substring(num, end);
			while (space(inner[end])) end++;
			inner = inner.substring(end);

			if (action === 'expect') {
				inner.split(/[\n\r\s\t]*,[\n\r\s\t]*/g).forEach(key => {
					if (!IDENT.test(key)) throw new Error(`Cannot read the names of "expect": ${JSON.stringify(inner)}`);
					initials.add(key);
				});
			} else if (action === 'var') {
				num = inner.indexOf('=');
				if (!~num) throw new Error(`Expected "=" in "var" block: ${JSON.stringify(inner)}`);
				let key = inner.substring(0, num++).trim();
				inner = inner.substring(num).trim().replace(/[;]$/, '');
				txt += `var ${key}=${inner};`;
			} else if (action === 'each') {
				// Block-scoped `let` so nested `#each` loops don't clobber the
				// outer loop's iteration variable or accumulator. Previous
				// `var`-based output hoisted `i` and `$$a` to function scope,
				// so an inner `#each` reassigned them and the outer loop
				// terminated after one pass.
				num = inner.search(EACH);
				stack.push(action);
				if (!~num) {
					txt += `for(let i=0,$$a=${inner};i<$$a.length;i++){`;
				} else {
					let list = inner.substring(0, num).trim();
					inner = inner.substring(num + 3).trim();
					let [item, idx='i'] = inner.replace(/[()\s]/g, '').split(','); // (item, idx?)
					txt += `for(let ${idx}=0,${item},$$a=${list};${idx}<$$a.length;${idx}++){${item}=$$a[${idx}];`;
				}
			} else if (action === 'if') {
				txt += `if(${inner}){`;
				stack.push(action);
			} else if (action === 'elif' || action === 'else') {
				if (stack[stack.length - 1] !== 'if') throw new Error(`Unexpected "${action}" outside of an "if" block`);
				if (ended.has(stack.length)) throw new Error(`Unexpected "${action}" after "else"`);
				if (action === 'elif') {
					txt += `}else if(${inner}){`;
				} else {
					ended.add(stack.length);
					txt += `}else{`;
				}
			} else if (action in extra) {
				if (inner) {
					// parse arguments, `defer=true` -> `{ defer: true }`
					let pairs = args(action, inner);
					inner = pairs.length ? '{' + pairs.join() + '}' : '';
				}
				inner = inner || '{}';
				wip += '${' + (options.async ? 'await ' : '') + '$$2["' + action + '"](' + inner + ',$$2)}';
			} else {
				throw new Error(`Unknown "${action}" block`);
			}
		} else if (char === '/') {
			action = inner.substring(1);
			if (!stack.length) throw new Error(`Unexpected "/${action}" with no open block`);
			ended.delete(stack.length);
			let open = stack.pop();
			close();
			if (action === open) txt += '}';
			else throw new Error(`Expected to close "${open}" block; closed "${action}" instead`);
		} else {
			if (match.raw) wip += '${' + inner + '}'; // {{{ raw }}}
			else wip += '${$$1(' + inner + ')}';
			if (options.loose) {
				for (let found: RegExpExecArray | null; found = VAR.exec(inner);) {
					if (!KEYWORDS.test(found[1])) initials.add(found[1]);
				}
			}
		}
	}

	if (stack.length > 0) {
		throw new Error(`Unterminated "${stack.pop()}" block`);
	}

	if (last < input.length) {
		chunk = input.substring(last);
		wip += literal ? chunk.replace(LITERAL, '\\$&') : chunk;
	}

	close();

	let head = initials.size ? `{${ [...initials].join() }}=$$3,$$x` : ' $$x';
	return `var${head + txt}return $$x`;
}
