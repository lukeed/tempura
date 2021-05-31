export function transform(input: string, options?: {
	props?: string[];
	minify?: boolean;
	extra?: {
		[directive: string]: (inner: string, full: string) => string;
	}
}): string;

export type Compiler = <T extends Record<string, any>> (data: T) => string;

export function compile(template: string, options?: {
	escape?: <T=unknown>(value: T) => T|string;
}): Compiler;
