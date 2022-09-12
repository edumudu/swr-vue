/**
 * Thanks to vercel/swr
 * https://github.com/vercel/swr/blob/main/_internal/utils/hash.ts
 */
import { createUnrefFn } from '@vueuse/core';

import { isUndefined } from '@/utils/check-types';

// use WeakMap to store the object->key mapping
// so the objects can be garbage collected.
// WeakMap uses a hashtable under the hood, so the lookup
// complexity is almost O(1).
const table = new WeakMap<object, number | string>();

// counter of the key
let counter = 0;

// A stable hash implementation that supports:
// - Fast and ensures unique hash properties
// - Handles unserializable values
// - Handles object key ordering
// - Generates short results
//
// This is not a serialization function, and the result is not guaranteed to be
// parsable.
export const stableHash = createUnrefFn((arg: any): string => {
  const type = typeof arg;
  const constructor = arg && arg.constructor;
  const isDate = constructor === Date;

  let result: any;
  let index: any;

  if (Object(arg) === arg && !isDate && constructor !== RegExp) {
    // Object/function, not null/date/regexp. Use WeakMap to store the id first.
    // If it's already hashed, directly return the result.
    result = table.get(arg);
    if (result) return result;

    // Store the hash first for circular reference detection before entering the
    // recursive `stableHash` calls.
    // For other objects like set and map, we use this id directly as the hash.
    counter += 1;
    result = `${counter}~`;
    table.set(arg, result);

    if (constructor === Array) {
      // Array.
      result = '@';

      for (index = 0; index < arg.length; index += 1) {
        result += `${stableHash(arg[index])},`;
      }

      table.set(arg, result);
    }

    if (constructor === Object) {
      // Object, sort keys.
      const keys = Object.keys(arg).sort();

      result = '#';
      index = keys.pop();

      while (!isUndefined(index)) {
        if (!isUndefined(arg[index])) {
          result += `${index}:${stableHash(arg[index])},`;
        }

        index = keys.pop();
      }

      table.set(arg, result);
    }
  } else {
    /* eslint-disable no-nested-ternary */
    result = isDate
      ? arg.toJSON()
      : type === 'symbol'
      ? arg.toString()
      : type === 'string'
      ? JSON.stringify(arg)
      : `${arg}`;
    /* eslint-enable no-nested-ternary */
  }

  return result;
});
