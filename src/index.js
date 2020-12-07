const param = 'xyz';

export function transform(input) {
	let locals = {};
	let stack=[], vars={};
	// let cache; // includes cache

	let rgx = /{{\s*(.*?)\s*}}/g;
	let last=0, wip='', txt='', match;

	let char, num, action, tmp;

	function close() {
		if (wip.length > 0) {
			// TODO: options.minify
			// txt += (txt ? 'output+=' : '=') + '`' + (true ? wip.replace(/([\t\s]+(?=<|$)|(\r?\n)+)/g, '') : wip) + '`;'; // template literal
			txt += (txt ? 'output+=' : '=') + '"' + (true ? wip.replace(/([\t\s]+(?=<|$)|(\r?\n)+)/g, '') : wip) + '";';
		} else if (txt.length === 0) {
			txt = '="";'
		}
		wip = '';
	}

	function ident(key) {
		if (vars[key] || locals[key]) {
			return key;
		}

		var i=0, arr=key.split('.'), str='';
		var tmp, rgx=/^\d|[^a-z0-9_$]/gi;

		for (; i < arr.length; i++) {
			tmp = arr[i];
			if (i===0 && (vars[tmp] || locals[tmp])) {
				str += tmp;
			} else {
				if (i===0) str += param;
				str += rgx.test(tmp) ? `[${JSON.stringify(tmp)}]` : `.${tmp}`;
			}
		}

		return str;
	}

	while (match = rgx.exec(input)) {
		let [full, inner] = match;
		// wip += input.substring(last, match.index).replace(/(\r?\n)+$/g, ''); // template literal
		if (wip) wip += '+"';
		wip += input.substring(last, match.index).replace(/(\r?\n)+$/g, '');
		last = match.index + full.length;

		char = inner.charAt(0);
		if (char === '!') continue;

		if (char === '#') {
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
				txt += `var ${tmp}=${inner};`;
			} else if (action === 'each') {
				num = inner.indexOf(' as ');
				tmp = inner.substring(0, num).trim();
				inner = inner.substring(num+4).trim();

				let [item, idx='i'] = inner.replace(/[()\s]/g, '').split(','); // (item, idx?)

				txt += `for(var ${idx}=0,${item},arr=${ident(tmp)};${idx}<arr.length;${idx}++){${item}=arr[${idx}];`;
				stack.push(action + '~' + item + ',' + idx); // 'each~item,idx'
				vars[item] = vars[idx] = true;
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
			// wip += '${' + ident(inner) + '}'; // template literal
			// TODO: options.escape
			wip += '"+' + ident(inner);
		}
	}

	if (wip) close();

	return 'var output' + txt + 'return output';
}

export function compile(body) {
	return new Function(param, body);
}
