import { Ref } from 'vue';

export type AnyFunction = (...args: any[]) => any | Promise<any>;

export type MaybeRef<T> = T | Ref<T>;
export type DeepMaybeRef<T> = { [K in keyof T]: MaybeRef<T[K]> };
