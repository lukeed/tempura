export type Args = Record<string, any>;
export type Blocks = Record<string, Compiler>;
export type Compiler = <T extends Args> (data?: T, blocks?: Blocks) => Promise<string>|string;

export interface Options {
	loose?: boolean;
	props?: string[];
	blocks?: Blocks;
	async?: boolean;
}

export function esc<T=unknown>(value: T): T|string;
export function transform(input: string, options?: Options & { format?: 'esm' | 'cjs' }): string;

export function compile(input: string, options?: Options & { async: true }): <T extends Args> (data: T) => Promise<string>;
export function compile(input: string, options?: Options & { async: false }): <T extends Args> (data: T) => string;
export function compile(input: string, options?: Options & { escape?: typeof esc; }): Compiler;
