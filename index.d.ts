export interface Options {
	props?: string[];
	minify?: boolean;
	// escape?: boolean;
}

export function transform(input: string, options?: Options): string;

export type Compiler = <T extends Record<string, any>> (data: T) => string;
export function compile(template: string): Compiler;
