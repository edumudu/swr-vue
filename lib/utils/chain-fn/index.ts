import { AnyFunction } from '@/types';

export const chainFns = <F extends (AnyFunction | undefined)[]>(...fns: F) => {
  const validFns = fns.filter(<T>(maybeFn: T | undefined): maybeFn is T => !!maybeFn);

  return (...params: Parameters<Exclude<F[number], undefined>>) =>
    validFns.forEach((fn) => fn(...params));
};
