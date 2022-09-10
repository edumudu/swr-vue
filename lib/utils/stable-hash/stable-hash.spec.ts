/**
 * Thanks to vercel/swr
 * https://github.com/vercel/swr/blob/main/test/unit/utils.test.tsx
 */

import { ref } from 'vue';

import { stableHash as hash } from '.';

beforeEach(() => {
  vi.useRealTimers();
});

describe('stableHash', () => {
  it('should hash arguments correctly', async () => {
    // Primitives
    expect(hash(['key'])).toEqual('@"key",');
    expect(hash([1])).toEqual('@1,');
    expect(hash(['false'])).toEqual('@"false",');
    expect(hash([false])).toEqual('@false,');
    expect(hash([true])).toEqual('@true,');
    expect(hash([null])).toEqual('@null,');
    expect(hash(['null'])).toEqual('@"null",');
    expect(hash([undefined])).toEqual('@undefined,');
    expect(hash([NaN])).toEqual('@NaN,');
    expect(hash([Infinity])).toEqual('@Infinity,');
    expect(hash([''])).toEqual('@"",');

    // Encodes `"`
    expect(hash(['","', 1])).not.toEqual(hash(['', '', 1]));

    // BigInt
    expect(hash([BigInt(1)])).toEqual('@1,');

    // Date
    const date = new Date();
    expect(hash([date])).toEqual(`@${date.toJSON()},`);
    expect(hash([new Date(1234)])).toEqual(hash([new Date(1234)]));

    // Regex
    expect(hash([/regex/])).toEqual('@/regex/,');

    // Symbol
    expect(hash([Symbol('key')])).toMatch('@Symbol(key),');
    const symbol = Symbol('foo');
    expect(hash([symbol])).toMatch(hash([symbol]));

    // Due to serialization, those three are equivalent
    expect(hash([Symbol.for('key')])).toMatch(hash([Symbol.for('key')]));
    expect(hash([Symbol('key')])).toMatch(hash([Symbol('key')]));
    expect(hash([Symbol('key')])).toMatch(hash([Symbol.for('key')]));

    // Set, Map, Buffer...
    const set = new Set();
    expect(hash([set])).not.toMatch(hash([new Set()]));
    expect(hash([set])).toMatch(hash([set]));
    const map = new Map();
    expect(hash([map])).not.toMatch(hash([new Map()]));
    expect(hash([map])).toMatch(hash([map]));
    const buffer = new ArrayBuffer(0);
    expect(hash([buffer])).not.toMatch(hash([new ArrayBuffer(0)]));
    expect(hash([buffer])).toMatch(hash([buffer]));

    // Serializable objects
    expect(hash([{ x: 1 }])).toEqual('@#x:1,,');
    expect(hash([{ '': 1 }])).toEqual('@#:1,,');
    expect(hash([{ x: { y: 2 } }])).toEqual('@#x:#y:2,,,');
    expect(hash([[]])).toEqual('@@,');
    expect(hash([[[]]])).not.toMatch(hash([[], []]));

    // Circular
    const o: any = {};
    o.o = o;
    expect(hash([o])).toEqual(hash([o]));
    expect(hash([o])).not.toEqual(hash([{}]));
    const a: any = [];
    a.push(a);
    expect(hash([a])).toEqual(hash([a]));
    expect(hash([a])).not.toEqual(hash([[]]));
    const o2: any = {};
    const a2: any = [o2];
    o2.a = a2;
    expect(hash([o2])).toEqual(hash([o2]));

    // Unserializable objects
    expect(hash([() => {}])).toMatch(/@\d+~,/);
    expect(hash([class {}])).toMatch(/@\d+~,/);
  });

  it('should hash arguments correctly with refs', async () => {
    // Primitives
    expect(hash(ref(['key']))).toEqual('@"key",');
    expect(hash(ref([1]))).toEqual('@1,');
    expect(hash(ref(['false']))).toEqual('@"false",');
    expect(hash(ref([false]))).toEqual('@false,');
    expect(hash(ref([true]))).toEqual('@true,');
    expect(hash(ref([null]))).toEqual('@null,');
    expect(hash(ref(['null']))).toEqual('@"null",');
    expect(hash(ref([undefined]))).toEqual('@undefined,');
    expect(hash(ref([NaN]))).toEqual('@NaN,');
    expect(hash(ref([Infinity]))).toEqual('@Infinity,');
    expect(hash(ref(['']))).toEqual('@"",');
  });
});
