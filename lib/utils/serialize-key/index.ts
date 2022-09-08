import { createUnrefFn } from '@vueuse/core';

import type { Key, KeyArguments } from '@/types';

import { isFunction } from '../check-types';
import { stableHash } from '../stable-hash';

export const serializeKey = createUnrefFn((key: Key) => {
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
    key: !isEmptyArray && !!sanitizedKey ? stableHash(sanitizedKey) : '',
    args: sanitizedKey,
  };
});
