export type Next = () => void | Promise<void>;
export type StopFunc<T> = (context: T) => boolean;

export type Pipe<A> = (action: A, cb: (context?: any) => void) => Promise<unknown> | unknown;

export type Stop<T> = (context: T, func: StopFunc<T>) => Promise<void> | void;

export type PipeWithName<A> = {
  [key: string]: Pipe<A>;
};
