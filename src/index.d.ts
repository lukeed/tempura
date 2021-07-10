export type Args = Record<string, any>;
export type Block<T extends Args = Args> = (args: T) => string;
export type Compiler = <T extends Record<string, any>> (data: T) => string;

export interface Options {
	props?: string[];
	blocks?: Record<string, Block>;
	async?: boolean;
}

export function esc<T=unknown>(value: T): T|string;

export function compile(input: string, options?: Options & { escape?: typeof esc; }): Compiler;
export function transform(input: string, options?: Options & { format?: 'esm' | 'cjs' }): string;
