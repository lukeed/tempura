export type Args = Record<string, any>;
export type Block<T extends Args = Args> = (args: T) => string;

export interface Options {
	props?: string[];
	blocks?: Record<string, Block>;
}

export function gen(input: string, options?: Options): string;
export function esc<T=unknown>(value: T): T|string;
