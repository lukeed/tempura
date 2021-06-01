export interface Options {
	props?: string[];
	minify?: boolean;
	extra?: {
		[directive: string]: (inner: string, full: string) => string;
	}
}

export function gen(input: string, options?: Options): string;
export function esc<T=unknown>(value: T): T|string;
