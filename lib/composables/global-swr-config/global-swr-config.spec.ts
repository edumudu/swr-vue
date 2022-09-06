import { provide, reactive, ref, UnwrapRef } from 'vue';
import type { Mock } from 'vitest';

import { defaultConfig, globalConfigKey } from '@/config';
import { AnyFunction, CacheState, Key, SWRConfig } from '@/types';
import { useInjectedSetup, useSetup } from '@/utils/test';
import { MapAdapter } from '@/cache';

import { useSWRConfig, configureGlobalSWR } from '.';

describe('useSWRConfig', () => {
  it.each([
    [{}],
    [{ revalidateIfStale: true }],
    [{ revalidateIfStale: false }],
    [{ revalidateIfStale: false, revalidateOnFocus: true }],
    [{ revalidateIfStale: true, revalidateOnFocus: false }],
  ])('should get configs from global configuration: "%s"', (objToProvide) => {
    const { config } = useInjectedSetup(
      () => provide(globalConfigKey, ref(objToProvide)),
      () => useSWRConfig(),
    );

    expect(config.value).toEqual(objToProvide);
  });

  it('should return default config if not have an provided one', () => {
    const instance = useSetup(useSWRConfig);

    expect(instance.config).toEqual(defaultConfig);
  });
});

describe('configureGlobalSWR', () => {
  vi.mock('vue', async () => {
    const original = (await vi.importActual('vue')) as Record<string, unknown>; // Step 2.

    return {
      ...original,
      provide: vi.fn(original.provide as AnyFunction),
    };
  });

  const provideMock = provide as Mock<any[], any>;

  it('should provide the default config if none is provided', () => {
    useSetup(() => configureGlobalSWR({}));

    expect(provideMock).toHaveBeenCalled();
    expect(provideMock.mock.calls[0][0]).toEqual(globalConfigKey);
    expect(provideMock.mock.calls[0][1].value).toEqual(defaultConfig);
  });

  it('should merge context config and the passed by argument', () => {
    const injectedConfig: Partial<SWRConfig> = Object.freeze({
      ...globalConfigKey,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });

    useInjectedSetup(
      () => provide(globalConfigKey, ref(injectedConfig)),
      () => configureGlobalSWR({ revalidateIfStale: true, revalidateOnFocus: false }),
    );

    expect(provideMock).toHaveBeenCalled();
    expect(provideMock.mock.calls[1][1].value).toEqual({
      ...injectedConfig,
      revalidateOnFocus: false,
      revalidateIfStale: true,
    });
  });
});

describe('mutate', () => {
  const cacheProvider = reactive(new MapAdapter());
  const defaultKey = 'Default key';

  const useSWRConfigWrapped = () =>
    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWRConfig(),
    );

  const setDataToCache = (key: Key, data: UnwrapRef<Partial<CacheState>>) => {
    cacheProvider.set(key, {
      error: ref(data.error),
      data: ref(data.data),
      isValidation: ref(data.isValidating || false),
      fetchedIn: ref(data.fetchedIn || new Date()),
    });
  };

  beforeEach(() => {
    cacheProvider.clear();
    setDataToCache(defaultKey, { data: 'cached data' });
  });

  it('should write in the cache the value resolved from promise passed to mutate', async () => {
    const { mutate } = useSWRConfigWrapped();

    await mutate(defaultKey, Promise.resolve('resolved value'));

    expect(cacheProvider.get(defaultKey)?.data).toEqual('resolved value');
  });

  it('should write in the cache the value returned from function passed to mutate', async () => {
    const { mutate } = useSWRConfigWrapped();

    await mutate(defaultKey, () => 'sync resolved value');
    expect(cacheProvider.get(defaultKey)?.data).toEqual('sync resolved value');

    await mutate(defaultKey, () => Promise.resolve('async resolved value'));
    expect(cacheProvider.get(defaultKey)?.data).toEqual('async resolved value');
  });

  it.each([
    'cached value',
    1000,
    { id: 1, name: 'John', email: 'john@example.com' },
    ['orange', 'apple', 'banana'],
  ])(
    'should call update function passing the current cached data to first argument',
    (cachedData) => {
      const updateFn = vi.fn();

      setDataToCache(defaultKey, { data: cachedData });

      const { mutate } = useInjectedSetup(
        () => configureGlobalSWR({ cacheProvider }),
        () => useSWRConfig(),
      );

      mutate(defaultKey, updateFn);

      expect(updateFn).toBeCalled();
      expect(updateFn).toBeCalledWith(cachedData);
    },
  );

  it('should use the value resolved from updateFn for mutate`s return value', async () => {
    const { mutate } = useSWRConfigWrapped();

    expect(await mutate(defaultKey, () => 'resolved data')).toEqual('resolved data');
    expect(await mutate(defaultKey, () => Promise.resolve('resolved data'))).toEqual(
      'resolved data',
    );
    expect.assertions(2);
  });

  it('should re-throw if an error ocours inside updateFn or promise passed rejects', async () => {
    const { mutate } = useSWRConfigWrapped();

    const syncError = new Error('sync error');
    const asyncError = new Error('async error');
    const promiseError = new Error('promise error');

    await expect(
      mutate(defaultKey, () => {
        throw syncError;
      }),
    ).rejects.toThrowError(syncError);

    await expect(mutate(defaultKey, () => Promise.reject(asyncError))).rejects.toThrowError(
      asyncError,
    );
    await expect(mutate(defaultKey, Promise.reject(promiseError))).rejects.toThrowError(
      promiseError,
    );
    expect.assertions(3);
  });

  it('should write `optimisticData` to cache right away and ser to resolved value from updateFn after', async () => {
    const { mutate } = useSWRConfigWrapped();

    const promise = mutate(defaultKey, Promise.resolve('resolved data'), {
      optimisticData: 'optimistic data',
    });

    expect(cacheProvider.get(defaultKey)?.data).toEqual('optimistic data');

    await promise;
    expect(cacheProvider.get(defaultKey)?.data).toEqual('resolved data');
  });

  it('should write rollback data writed in cache whe using `opoptimisticData` and `rollbackOnError`', async () => {
    const { mutate } = useSWRConfigWrapped();

    try {
      await mutate(defaultKey, Promise.reject(), {
        optimisticData: 'optimistic data',
        rollbackOnError: true,
      });
    } catch (error) {
      expect(cacheProvider.get(defaultKey)?.data).toEqual('cached data');
    }

    expect.assertions(1);
  });
});
