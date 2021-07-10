import type { Options } from 'tempura/utils';

export function esc<T=unknown>(value: T): T|string;

export type Compiler = <T extends Record<string, any>> (data: T) => string;
export function compile(input: string, options?: Options & { escape?: typeof esc; }): Compiler;
export function transform(input: string, options?: Options & { format?: 'esm' | 'cjs' }): string;
