import { mergeConfig } from '.';

describe('mergeConfig', () => {
  it.each([
    [{}, {}, {}],
    [{}, undefined, {}],
    [{}, { revalidateIfStale: true }, { revalidateIfStale: true }],
    [{ revalidateIfStale: true }, {}, { revalidateIfStale: true }],
    [{ revalidateIfStale: true }, { revalidateIfStale: true }, { revalidateIfStale: true }],
    [{ revalidateIfStale: false }, { revalidateIfStale: true }, { revalidateIfStale: true }],
    [{ revalidateIfStale: true }, { revalidateIfStale: false }, { revalidateIfStale: false }],
    [
      { revalidateIfStale: false, revalidateOnFocus: true },
      { revalidateIfStale: false },
      { revalidateIfStale: false, revalidateOnFocus: true },
    ],
    [
      { revalidateIfStale: true },
      { revalidateIfStale: true, revalidateOnFocus: true },
      { revalidateIfStale: true, revalidateOnFocus: true },
    ],
  ])('should merge two configs: %s', (obj1, obj2, expectedResult) => {
    expect(mergeConfig(obj1, obj2)).toEqual(expectedResult);
  });
});
