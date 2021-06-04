export interface Options {
	props?: string[];
	blocks?: {
		[directive: string]: (inner: string, full: string) => string | (()=>string);
	}
}

export function gen(input: string, options?: Options): string;
export function esc<T=unknown>(value: T): T|string;
