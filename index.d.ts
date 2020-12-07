export type Compiler<T extends Record<string, any>> = (data: T) => string;
export function transform(input: string, options?: any): string;
export function compile(template: string): Compiler;
