import { provide, ref } from 'vue';
import type { Mock } from 'vitest';

import { defaultConfig, globalConfigKey } from '@/config';
import { AnyFunction, SWRConfig } from '@/types';
import {
  getDataFromMockedCache,
  mockedCache,
  setDataToMockedCache,
  useInjectedSetup,
  useSetup,
} from '@/utils/test';

import { useSWRConfig, configureGlobalSWR } from '.';

const throwError = (error: Error) => {
  throw error;
};

vi.mock('vue', async () => {
  const original = (await vi.importActual('vue')) as Record<string, unknown>;

  return {
    ...original,
    provide: vi.fn(original.provide as AnyFunction),
  };
});

describe('useSWRConfig', () => {
  it.each([
    [{}],
    [{ revalidateIfStale: true }],
    [{ revalidateIfStale: false }],
    [{ revalidateIfStale: false, revalidateOnFocus: true }],
    [{ revalidateIfStale: true, revalidateOnFocus: false }],
  ])('should get configs from global configuration: "%s"', (objToProvide) => {
    const { config } = useInjectedSetup(
      () => configureGlobalSWR(objToProvide),
      () => useSWRConfig(),
    );

    expect(config.value).toContain(objToProvide);
  });

  it('should return default config if not have an provided one', () => {
    const instance = useSetup(useSWRConfig);

    expect(instance.config).toEqual(defaultConfig);
  });
});

describe('configureGlobalSWR', () => {
  const provideMock = provide as Mock<any[], any>;

  it('should provide the default config if none is provided', () => {
    useSetup(() => configureGlobalSWR({}));

    expect(provideMock).toHaveBeenCalled();
    expect(provideMock.mock.calls[0][0]).toEqual(globalConfigKey);
    expect(provideMock.mock.calls[0][1].value).toEqual(defaultConfig);
  });

  it('should merge context config and the passed by argument', () => {
    const injectedConfig: Partial<SWRConfig> = Object.freeze({
      ...defaultConfig,
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

// eslint-disable-next-line prettier/prettier
describe.each([
  'default',
  'injected'
])('mutate - %s', (approach) => {
  const isDefaultApproach = approach === 'default';
  const cacheProvider = isDefaultApproach ? defaultConfig.cacheProvider : mockedCache;
  const defaultKey = 'Default key';

  const useSWRConfigWrapped = () =>
    isDefaultApproach
      ? useSetup(() => useSWRConfig())
      : useInjectedSetup(
          () => configureGlobalSWR({ cacheProvider }),
          () => useSWRConfig(),
        );

  beforeEach(() => {
    cacheProvider.clear();
    setDataToMockedCache(defaultKey, { data: 'cached data' }, cacheProvider);
  });

  it.each([
    ['sync value', 'sync value'],
    [Promise.resolve('resolved value'), 'resolved value'],
    [{ data: 'sync obj' }, { data: 'sync obj' }],
    [() => 'returned value', 'returned value'],
    [() => Promise.resolve('returned promise'), 'returned promise'],
    [() => ({ data: 'returned obj' }), { data: 'returned obj' }],
  ])(
    'should write in the cache the value returned from function passed to mutate when that key does not exists in the cache yet: #%#',
    async (mutateVal, expected) => {
      cacheProvider.clear();

      const { mutate } = useSWRConfigWrapped();
      const key = 'key-1';

      await mutate(key, mutateVal);
      expect(getDataFromMockedCache(key, cacheProvider)).toBeDefined();
      expect(getDataFromMockedCache(key, cacheProvider)?.data).toEqual(expected);
    },
  );

  it('should write in the cache the value returned from function passed to mutate', async () => {
    const { mutate } = useSWRConfigWrapped();

    await mutate(defaultKey, () => 'sync resolved value');
    expect(getDataFromMockedCache(defaultKey, cacheProvider)?.data).toEqual('sync resolved value');

    await mutate(defaultKey, () => Promise.resolve('async resolved value'));
    expect(getDataFromMockedCache(defaultKey, cacheProvider)?.data).toEqual('async resolved value');
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

      setDataToMockedCache(defaultKey, { data: cachedData }, cacheProvider);

      const { mutate } = useSWRConfigWrapped();

      mutate(defaultKey, updateFn);

      expect(updateFn).toBeCalled();
      expect(updateFn).toBeCalledWith(cachedData);
    },
  );

  it('should use the value resolved from updateFn for mutate`s return value', async () => {
    const { mutate } = useSWRConfigWrapped();
    const expected = 'resolved value';

    expect(await mutate(defaultKey, expected)).toEqual(expected);
    expect(await mutate(defaultKey, () => expected)).toEqual(expected);
    expect(await mutate(defaultKey, () => Promise.resolve(expected))).toEqual(expected);
    expect.assertions(3);
  });

  it.each([
    [new Error('sync error'), () => throwError(new Error('sync error'))],
    [new Error('async error'), () => Promise.reject(new Error('async error'))],
  ])('should re-throw if an error ocours inside updateFn: #%#', async (error, updateFn) => {
    const { mutate } = useSWRConfigWrapped();

    await expect(mutate(defaultKey, updateFn)).rejects.toThrowError(error);

    expect.assertions(1);
  });

  it('should re-throw if promise passed to mutate rejects', async () => {
    const { mutate } = useSWRConfigWrapped();

    const promiseError = new Error('promise error');
    const promise = Promise.reject(promiseError);

    await expect(mutate(defaultKey, promise)).rejects.toThrowError(promiseError);
    expect.assertions(1);
  });

  it('should write `optimisticData` to cache right away and set to resolved value from updateFn after', async () => {
    const { mutate } = useSWRConfigWrapped();

    const promise = mutate(defaultKey, Promise.resolve('resolved data'), {
      optimisticData: 'optimistic data',
    });

    expect(getDataFromMockedCache(defaultKey, cacheProvider)?.data).toEqual('optimistic data');

    await promise;
    expect(getDataFromMockedCache(defaultKey, cacheProvider)?.data).toEqual('resolved data');
  });

  it.each([
    { optimisticData: 'optimistic data', updateFn: () => Promise.reject() },
    { optimisticData: 'optimistic data', updateFn: () => throwError(new Error()) },
    { optimisticData: undefined, updateFn: () => Promise.reject() },
    { optimisticData: undefined, updateFn: () => throwError(new Error()) },
  ])(
    'should rollback data writed in cache when `optimisticData = $optimisticData` and `rollbackOnError = true`: #%#',
    async ({ optimisticData, updateFn }) => {
      const { mutate } = useSWRConfigWrapped();

      try {
        await mutate(defaultKey, updateFn, {
          optimisticData,
          rollbackOnError: true,
        });
      } catch (error) {
        expect(getDataFromMockedCache(defaultKey, cacheProvider)?.data).toEqual('cached data');
      }

      expect.assertions(1);
    },
  );
});
