const ENDLINES = /[\r\n]+$/g;
const VAR = /(?:^|[-*+^|%/&=\s])([a-zA-Z$_][\w$]*)(?:(?=$|[-*+^|%/&=\s]))/g;
const ARGS = /([a-zA-Z$_][^\s=]*)\s*=\s*((["`'])(?:(?=(\\?))\4.)*?\3|{[^}]*}|\[[^\]]*]|\S+)/g;

function quote(src, i) {
	for (let q = src[i++]; i < src.length; i++) {
		if (src[i] === '\\') i++;
		else if (src[i] === q) return i + 1;
	}
	return -1;
}

// The next {{ … }} or {{{ … }}} from `from`; it closes outside quotes and nested braces, except in a {{! comment }}.
function tag(src, from) {
	let index = src.indexOf('{{', from);
	if (index === -1) return;
	let raw = src[index + 2] === '{';
	let start = index + (raw ? 3 : 2);
	let end = raw ? '}}}' : '}}';
	let note = /^\s*!/.test(src.substring(start, start + 64));
	for (let i = start, depth = 0; i < src.length; i++) {
		let char = src[i];
		if (!note && (char === '"' || char === "'" || char === '`')) {
			let next = quote(src, i);
			if (next !== -1) i = next - 1;
		} else if (!note && char === '{') {
			depth++;
		} else if (!note && char === '}' && depth > 0) {
			depth--;
		} else if (src.startsWith(end, i)) {
			return { index, raw, text: src.substring(index, i + end.length), inner: src.substring(start, i) };
		}
	}
}

// $$1 = escape()
// $$2 = extra blocks
// $$3 = template values
export function gen(input, options) {
	options = options || {};

	let char, num, action, tmp;
	let last = 0;
	let wip='', txt='', match, inner;

	let extra=options.blocks||{}, stack=[];
	let initials = new Set(options.props||[]);

	function close() {
		if (wip.length > 0) {
			txt += (txt ? '$$x+=' : '=') + '`' + wip + '`;';
		} else if (txt.length === 0) {
			txt = '="";'
		}
		wip = '';
	}

	while (match = tag(input, last)) {
		wip += input.substring(last, match.index).replace(ENDLINES, '');
		last = match.index + match.text.length;

		inner = match.inner.trim();
		char = inner.charAt(0);

		if (char === '!') {
			// comment, continue
		} else if (char === '#') {
			close();
			[, action, inner] = /^#\s*(\w[\w\d]+)\s*([^]*)/.exec(inner);

			if (action === 'expect') {
				inner.split(/[\n\r\s\t]*,[\n\r\s\t]*/g).forEach(key => {
					initials.add(key);
				});
			} else if (action === 'var') {
				num = inner.indexOf('=');
				tmp = inner.substring(0, num++).trim();
				inner = inner.substring(num).trim().replace(/[;]$/, '');
				txt += `var ${tmp}=${inner};`;
			} else if (action === 'each') {
				// Block-scoped `let` so nested `#each` loops don't clobber the
				// outer loop's iteration variable or accumulator. Previous
				// `var`-based output hoisted `i` and `$$a` to function scope,
				// so an inner `#each` reassigned them and the outer loop
				// terminated after one pass.
				num = inner.indexOf(' as ');
				stack.push(action);
				if (!~num) {
					txt += `for(let i=0,$$a=${inner};i<$$a.length;i++){`;
				} else {
					tmp = inner.substring(0, num).trim();
					inner = inner.substring(num + 4).trim();
					let [item, idx='i'] = inner.replace(/[()\s]/g, '').split(','); // (item, idx?)
					txt += `for(let ${idx}=0,${item},$$a=${tmp};${idx}<$$a.length;${idx}++){${item}=$$a[${idx}];`;
				}
			} else if (action === 'if') {
				txt += `if(${inner}){`;
				stack.push(action);
			} else if (action === 'elif') {
				txt += `}else if(${inner}){`;
			} else if (action === 'else') {
				txt += `}else{`;
			} else if (action in extra) {
				if (inner) {
					tmp = [];
					// parse arguments, `defer=true` -> `{ defer: true }`
					while (match = ARGS.exec(inner)) tmp.push(match[1] + ':' + match[2]);
					inner = tmp.length ? '{' + tmp.join() + '}' : '';
				}
				inner = inner || '{}';
				tmp = options.async ? 'await ' : '';
				wip += '${' + tmp + '$$2.' + action + '(' + inner + ',$$2)}';
			} else {
				throw new Error(`Unknown "${action}" block`);
			}
		} else if (char === '/') {
			action = inner.substring(1);
			inner = stack.pop();
			close();
			if (action === inner) txt += '}';
			else throw new Error(`Expected to close "${inner}" block; closed "${action}" instead`);
		} else {
			if (match.raw) wip += '${' + inner + '}'; // {{{ raw }}}
			else wip += '${$$1(' + inner + ')}';
			if (options.loose) {
				while (tmp = VAR.exec(inner)) {
					initials.add(tmp[1]);
				}
			}
		}
	}

	if (stack.length > 0) {
		throw new Error(`Unterminated "${stack.pop()}" block`);
	}

	if (last < input.length) {
		wip += input.substring(last).replace(ENDLINES, '');
	}

	close();

	tmp = initials.size ? `{${ [...initials].join() }}=$$3,$$x` : ' $$x';
	return `var${tmp + txt}return $$x`;
}
