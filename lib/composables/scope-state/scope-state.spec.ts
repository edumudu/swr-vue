import { useInjectedSetup, mockedCache } from '@/utils/test';
import { globalState } from '@/config';

import { useScopeState } from '.';

const cacheProvider = mockedCache;

const useScopeStateWrapped = () =>
  useInjectedSetup(
    () => {},
    () => useScopeState(cacheProvider),
  );

describe('useSWR - mutate', () => {
  beforeEach(() => {
    cacheProvider.clear();
  });

  it('should init scope in case that the scope does not have values', async () => {
    const { scopeState, revalidateCache } = useScopeStateWrapped();

    expect(scopeState.value).not.toBeUndefined();
    expect(scopeState.value.revalidateCache).toBeInstanceOf(Map);

    // toRefs values
    expect(revalidateCache.value).toBeInstanceOf(Map);
  });

  it('should return values for current scope', async () => {
    const key = 'key1';
    const revalidateCb = vi.fn();

    globalState.set(cacheProvider, {
      revalidateCache: new Map([[key, [revalidateCb]]]),
    });

    const { scopeState, revalidateCache } = useScopeStateWrapped();

    expect(scopeState.value.revalidateCache).toBeInstanceOf(Map);
    expect(scopeState.value.revalidateCache.size).toBe(1);
    expect(scopeState.value.revalidateCache.get(key)).toHaveLength(1);
    expect(scopeState.value.revalidateCache.get(key)).toContain(revalidateCb);

    // toRefs values
    expect(revalidateCache.value).toBeInstanceOf(Map);
    expect(revalidateCache.value.size).toBe(1);
    expect(revalidateCache.value.get(key)).toHaveLength(1);
    expect(revalidateCache.value.get(key)).toContain(revalidateCb);
  });
});
