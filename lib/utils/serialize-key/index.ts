import type { Key, KeyArguments } from '@/types';

import { isFunction } from '../check-types';
import { hash } from '../hash';

export const serializeKey = (key: Key) => {
  let sanitizedKey: KeyArguments = key;

  if (isFunction(sanitizedKey)) {
    try {
      sanitizedKey = sanitizedKey();
    } catch {
      sanitizedKey = '';
    }
  }

  const isEmptyArray = Array.isArray(sanitizedKey) && sanitizedKey.length === 0;

  return {
    key: !isEmptyArray && !!sanitizedKey ? hash(sanitizedKey) : '',
    args: sanitizedKey,
  };
};
