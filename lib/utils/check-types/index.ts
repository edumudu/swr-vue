import type { AnyFunction } from '@/types';

export const isFunction = <T extends AnyFunction = AnyFunction>(value: unknown): value is T =>
  typeof value === 'function';

export const isDate = <T extends Date = Date>(date: any): date is T => date.constructor === Date;
