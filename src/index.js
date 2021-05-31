const ENDLINES = /[\r\n]+$/g;
const CURLY = /{{\s*([\s\S]*?)\s*}}/g;

// $$1 = template values
export function transform(input, options={}) {
	let char, num, action, tmp;
	let last=0, wip='', txt='', match;

	let minify = !!options.minify, stack=[];
	let initials = new Set(options.props || []);

	function close() {
		if (wip.length > 0) {
			txt += (txt ? 'x+=' : '=') + '`' + (minify ? wip.replace(/([\t\s]+(?=<|$)|(\r?\n)+)/g, '') : wip) + '`;';
		} else if (txt.length === 0) {
			txt = '="";'
		}
		wip = '';
	}

	while (match = CURLY.exec(input)) {
		wip += input.substring(last, match.index).replace(ENDLINES, '');
		last = match.index + match[0].length;
		let inner = match[1].trim();

		char = inner.charAt(0);
		if (char === '!') {
			// comment, continue
		} else if (char === '#') {
			close();
			[, action, inner] = /^#\s*([a-zA-Z]+)\s*(.*)/.exec(inner);

			if (action === 'expect') {
				inner.trim().split(/[\n\r\s\t]*,[\n\r\s\t]*/g).forEach(key => {
					initials.add(key);
				});
			} else if (action === 'var') {
				num = inner.indexOf('=');
				tmp = inner.substring(0, num++).trim();
				inner = inner.substring(num).trim().replace(/[;]$/, '');
				txt += `var ${tmp}=${inner};`;
			} else if (action === 'each') {
				num = inner.indexOf(' as ');

				if (!!~num) {
					tmp = inner.substring(0, num).trim();
					inner = inner.substring(num + 4).trim();
					let [item, idx='i'] = inner.replace(/[()\s]/g, '').split(','); // (item, idx?)
					txt += `for(var ${idx}=0,${item},$$a=${tmp};${idx}<$$a.length;${idx}++){${item}=$$a[${idx}];`;
					stack.push(action + '~' + item + ',' + idx); // 'each~item,idx'
				} else {
					txt += `for(var i=0,$$a=${inner.trim()};i<$$a.length;i++){`;
					stack.push(action + '~' + 'i'); // 'each~i'
				}
			} else if (action === 'if') {
				txt += `if(${inner.trim()}){`;
				stack.push(action);
			} else if (action === 'elif') {
				txt += `}else if(${inner.trim()}){`;
			} else if (action === 'else') {
				txt += `}else{`;
			} else {
				// TODO: custom directive
				throw new Error(`unknown - ${JSON.stringify({ action })}`);
			}
		} else if (char === '/') {
			close();
			inner = stack.pop();
			if (action === inner) txt += '}';
			else if (inner === 'if' && (action === 'else' || action === 'elif')) txt += '}';
			else if (action === 'each' && inner.startsWith('each~')) txt += '}'; // end for loop
			else throw new Error(`mismatch – ${JSON.stringify({ expect: inner, actual: action })}`);
		} else {
			// TODO: options.escape
			wip += '${' + inner + '}';
		}
	}

	if (last < input.length) {
		wip += input.substring(last).replace(ENDLINES, '');
	}

	close();

	tmp = initials.size ? `{${ [...initials].join() }}=$$1,x` : ' x';
	return `var${tmp + txt}return x`;
}

export function compile(body) {
	return new Function('$$1', body);
}
