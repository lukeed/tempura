const param = 'xyz';
const ENDLINES = /(\r?\n)+$/g;
const INVALID = /^\d|[^A-Za-z0-9_$]/g;
const CURLY = /{{\s*(.*?)\s*}}/g;

export function transform(input, options={}) {
	let minify = !!options.minify;
	let stack=[], vars={};
	let locals = {};
	// let cache; // includes cache

	let last=0, wip='', txt='', match;
	let char, num, action, tmp;

	function close() {
		if (wip.length > 0) {
			txt += (txt ? 'x+=' : '=') + '`' + (minify ? wip.replace(/([\t\s]+(?=<|$)|(\r?\n)+)/g, '') : wip) + '`;';
		} else if (txt.length === 0) {
			txt = '="";'
		}
		wip = '';
	}

	function ident(key) {
		if (vars[key] || locals[key]) {
			return key;
		}

		let i=0, tmp, str='', arr=key.split(/[.]|(\[['"`]?.*[`'"]?\])/g);

		for (; i < arr.length; i++) {
			if (tmp = arr[i]) {
			if (i===0 && (vars[tmp] || locals[tmp])) {
				str += tmp;
			} else {
				if (i===0) str += param;
					if (tmp[0]==='[') str += tmp;
					else str += INVALID.test(tmp) ? `[${JSON.stringify(tmp)}]` : `.${tmp}`;
				}
			}
		}

		return str;
	}

	while (match = CURLY.exec(input)) {
		let [full, inner] = match;
		wip += input.substring(last, match.index).replace(ENDLINES, '');
		last = match.index + full.length;

		char = inner.charAt(0);
		if (char === '!') {
			// continue
		} else if (char === '#') {
			close();
			num = inner.indexOf(' ');
			action = !!~num ? inner.substring(1, num++) : inner.substring(num=1);
			inner = inner.substring(num);

			if (action === 'var') {
				num = inner.indexOf('=');
				tmp = inner.substring(0, num++).trim();
				inner = inner.substring(num).trim();

				locals[tmp] = true;
				// TODO: value is property vs function vs string
				// console.log({ tmp, inner });
				txt += `var ${tmp}=${inner.replace(/[;]$/, '')};`;
			} else if (action === 'each') {
				num = inner.indexOf(' as ');

				if (!!~num) {
					tmp = inner.substring(0, num).trim();
					inner = inner.substring(num+4).trim();
					let [item, idx='i'] = inner.replace(/[()\s]/g, '').split(','); // (item, idx?)
					txt += `for(var ${idx}=0,${item},arr=${ident(tmp)};${idx}<arr.length;${idx}++){${item}=arr[${idx}];`;
					stack.push(action + '~' + item + ',' + idx); // 'each~item,idx'
					vars[item] = vars[idx] = true;
				} else {
					tmp = inner.trim();
					txt += `for(var i=0,arr=${ident(tmp)};i<arr.length;i++){`;
					stack.push(action + '~' + 'i'); // 'each~i'
					vars['i'] = true;
				}
			} else if (action === 'if') {
				txt += `if(${ ident(inner.trim()) }){`;
				stack.push(action);
			} else if (action === 'else') {
				txt += `}else{`;
			} else {
				console.error('UNKNOWN', { inner, action })
			}
		} else if (char === '/') {
			close();
			inner = stack.pop();
			if (action === inner || (action === 'else' && inner === 'if')) {
				txt += '}';
			} else if (action === 'each' && inner.startsWith('each~')) {
				txt += '}'; // end for loop
				inner.substring(5).split(',').forEach(key => {
					vars[key] = false;
				});
			} else {
				console.error('MISMATCH', { action, inner });
				break;
			}
		} else {
			// TODO: options.escape
			wip += '${' + ident(inner) + '}';
		}
	}

	if (last < input.length) {
		wip += input.substring(last).replace(ENDLINES, '');
		close();
	} else {
		close();
	}

	return 'var x' + txt + 'return x';
}

export function compile(body) {
	return new Function(param, body);
}
