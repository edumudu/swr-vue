import type { Key, KeyArguments } from '@/types';
import { hash, isFunction } from '@/utils';

export const serializeKey = (key: Key) => {
  let sanitizedKey: KeyArguments = key;

  if (isFunction(sanitizedKey)) {
    try {
      sanitizedKey = sanitizedKey();
    } catch {
      sanitizedKey = '';
    }
  }

  return {
    key: hash(sanitizedKey),
    args: sanitizedKey,
  };
};
