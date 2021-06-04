import * as utils from 'tempura/utils';

export function compile(input, options) {
	options = options || {};
	return new Function('$$1', '$$2', '$$3', utils.gen(input, options)).bind(
		0, options.escape || utils.esc, options.blocks
	);
}

export function transform(input, options) {
	return (
		options && options.format === 'cjs'
		? 'var{esc:$$1}=require("tempura/utils");module.exports='
		: 'import{esc as $$1}from"tempura/utils";export default '
	) + 'function($$3,$$2){'+utils.gen(input, options)+'}';
}
