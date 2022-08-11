import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isRef, reactive, ref, UnwrapRef } from 'vue';
import flushPromises from 'flush-promises';

import { withSetup } from '@/utils/with-setup';
import { CacheProvider, CacheState, Key, SWRComposableConfig, SWRFetcher } from '@/types';
import { useInjectedSetup } from '@/utils/test';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = reactive<CacheProvider>(new Map());
const defaultKey = 'defaultKey';
const defaultFetcher = vi.fn((key: string) => key);
const defaultOptions: SWRComposableConfig = { dedupingInterval: 0 };

const setDataToCache = (key: Key, data: UnwrapRef<Partial<CacheState>>) => {
  cacheProvider.set(key, {
    error: ref(data.error),
    data: ref(data.data),
    isValidation: ref(data.isValidating || false),
    fetchedIn: ref(data.fetchedIn || new Date()),
  });
};

const dispatchEvent = (eventName: string, target: Element | Window | Document) => {
  const event = new Event(eventName, { bubbles: true });

  target.dispatchEvent(event);
};

describe('useSWR', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    cacheProvider.clear();
  });

  it('should return a ref to data, error and isValidating', () => {
    const { data, error, isValidating } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    expect(isRef(data)).toBeTruthy();
    expect(isRef(error)).toBeTruthy();
    expect(isRef(isValidating)).toBeTruthy();
  });

  it('should start isValidating as true', () => {
    const { isValidating } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    expect(isValidating.value).toBeTruthy();
  });

  it.each([
    [() => 'returnedData'],
    [() => 1],
    [() => ({ id: 2 })],
    [() => Promise.resolve('returnedData')],
  ])(
    'should set data returned from fetcher to data variable',
    async (fetcher: SWRFetcher<unknown>) => {
      const { data, isValidating } = useInjectedSetup(
        () => configureGlobalSWR({ cacheProvider }),
        () => useSWR(defaultKey, fetcher, defaultOptions),
      );

      expect(data.value).toEqual(undefined);

      await flushPromises();
      expect(data.value).toEqual(await fetcher());
      expect(isValidating.value).toBeFalsy();
    },
  );

  it.each([
    // eslint-disable-next-line prefer-promise-reject-errors
    [() => Promise.reject('Error in fetcher 1'), 'Error in fetcher 1'],
    [() => Promise.reject(new Error('Error in fetcher 2')), new Error('Error in fetcher 2')],
    [
      () => {
        throw new Error('Error in fetcher 3');
      },
      new Error('Error in fetcher 3'),
    ],
  ])('should set error when throw error in fetcher', async (fetcher, expectedError) => {
    const { data, isValidating, error } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, fetcher, defaultOptions),
    );

    await flushPromises();
    expect(data.value).toEqual(undefined);
    expect(error.value).toEqual(expectedError);
    expect(isValidating.value).toBeFalsy();
  });

  it('should set the same error in differnt `useSWR` calls with the same key', async () => {
    const [error1, error2] = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => {
        const error = new Error('Error in fetcher');

        const { error: errorA } = useSWR(defaultKey, () => 'fulfilled', defaultOptions);
        const { error: errorB } = useSWR(defaultKey, () => Promise.reject(error), defaultOptions);

        return [errorA, errorB];
      },
    );

    await flushPromises();
    expect(error1.value).toBeInstanceOf(Error);
    expect(error2.value).toBeInstanceOf(Error);
    expect(error1.value).toBe(error2.value);
  });

  it('should return cached value first then revalidate', async () => {
    vi.useFakeTimers();

    setDataToCache(defaultKey, {
      data: 'cachedData',
      fetchedIn: new Date(),
    });

    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('FetcherResult'), 1000);
        }),
    );

    const { data: swrData } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, fetcher, defaultOptions),
    );

    expect(swrData.value).toBe('cachedData');
    vi.advanceTimersByTime(1000);
    await flushPromises();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(swrData.value).toBe('FetcherResult');
  });

  it('should revalidate when focus page', async () => {
    setDataToCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, focusThrottleInterval: 0 }),
      () => useSWR(defaultKey, fetcher, defaultOptions),
    );

    dispatchEvent('focus', document);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(2);
    expect(data.value).toBe('FetcherResult');
  });

  it('should revalidate on focus just once inside focusThrottleInterval time span', async () => {
    vi.useFakeTimers();
    setDataToCache(defaultKey, { data: 'cachedData' });

    const focusThrottleInterval = 4000;
    const fetcher = vi.fn(defaultFetcher);

    useInjectedSetup(
      () =>
        configureGlobalSWR({
          cacheProvider,
          focusThrottleInterval,
          revalidateOnFocus: true,
        }),
      () => useSWR(defaultKey, fetcher, defaultOptions),
    );

    dispatchEvent('focus', document);
    expect(fetcher).toBeCalledTimes(1);

    vi.advanceTimersByTime(focusThrottleInterval - 1);
    dispatchEvent('focus', document);
    expect(fetcher).toBeCalledTimes(1);

    vi.advanceTimersByTime(1);
    dispatchEvent('focus', document);
    expect(fetcher).toBeCalledTimes(2);
    await flushPromises();

    vi.advanceTimersByTime(focusThrottleInterval - 1);
    dispatchEvent('focus', document);
    expect(fetcher).toBeCalledTimes(2);
  });

  it('should not revalidate when focus if config revalidateOnFocus is false', async () => {
    setDataToCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () =>
        useSWR(defaultKey, fetcher, {
          ...defaultOptions,
          revalidateOnFocus: false,
        }),
    );

    dispatchEvent('blur', document);
    dispatchEvent('focus', document);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(1);
    expect(data.value).toBe('FetcherResult');
  });

  it('should not revalidate if revalidateIfStale is false', async () => {
    setDataToCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () =>
        useSWR(defaultKey, fetcher, {
          ...defaultOptions,
          revalidateIfStale: false,
        }),
    );

    await flushPromises();
    expect(fetcher).toBeCalledTimes(0);
    expect(data.value).toBe('cachedData');
  });

  it('should revalidate when back online', async () => {
    setDataToCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, fetcher, defaultOptions),
    );

    dispatchEvent('online', document);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(2);
    expect(data.value).toBe('FetcherResult');
  });

  it('should not revalidate when back online if config revalidateOnReconnect is false', async () => {
    setDataToCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () =>
        useSWR(defaultKey, fetcher, {
          ...defaultOptions,
          revalidateOnReconnect: false,
        }),
    );

    dispatchEvent('online', document);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(1);
    expect(data.value).toBe('FetcherResult');
  });

  it('should be reactive to the key as function with ref', async () => {
    const key = ref('initialKey');
    const fetcher = vi.fn();

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(() => `testing-key/${key.value}`, fetcher, defaultOptions),
    );

    expect(fetcher).toBeCalledTimes(1);

    key.value = 'newKey';

    await flushPromises();
    expect(fetcher).toBeCalledTimes(2);
  });

  it('should recall fetcher if key threw and change to valid value', async () => {
    const key = ref();
    const fetcher = vi.fn();

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(() => `testing-key/${key.value.id}`, fetcher, defaultOptions),
    );

    expect(fetcher).toBeCalledTimes(0);

    key.value = { id: 1 };

    await flushPromises();
    expect(fetcher).toBeCalledTimes(1);
  });

  it.each([
    '/user/me',
    'https://google.com',
    ['/api/user', 4, 'authKey'],
    () => '/user/me',
    () => 'https://google.com',
    () => ['/api/user', 4, 'authKey'],
  ])('should call fetcher function passing keys as arguments: %#', async (key) => {
    const fetcher = vi.fn();
    let expectedArgs = typeof key === 'function' ? key() : key;

    expectedArgs = Array.isArray(expectedArgs) ? expectedArgs : [expectedArgs];

    withSetup(() => useSWR(key, fetcher, defaultOptions));

    expect(fetcher).toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledWith(...expectedArgs);
  });

  it.each([
    undefined,
    false as const,
    null,
    '',
    () => undefined,
    () => false as const,
    () => null,
    () => '',
    () => {
      throw new Error('Mock Error');
    },
  ])('should not call fetcher if key is/return falsy value or throw: %#', async (key) => {
    const fetcher = vi.fn();

    withSetup(() => useSWR(key, fetcher, defaultOptions));

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('should disable deduping if `dedupingInterval` if equal 0', () => {
    const fetcher = vi.fn();
    const key = 'key-1';

    const options: SWRComposableConfig = {
      ...defaultOptions,
      dedupingInterval: 0,
    };

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => {
        useSWR(key, fetcher, options);
        useSWR(key, fetcher, options);
        useSWR(key, fetcher, options);
        useSWR(key, fetcher, options);
      },
    );

    expect(fetcher).toBeCalledTimes(4);
  });

  it('should call the fetcher once if composables are called close of each other ', () => {
    const fetcher = vi.fn();
    const interval = 2000;
    const key = 'key-1';

    const options: SWRComposableConfig = {
      ...defaultOptions,
      dedupingInterval: interval,
    };

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => {
        useSWR(key, fetcher, options);
        useSWR(key, fetcher, options);
        useSWR(key, fetcher, options);
        useSWR(key, fetcher, options);
      },
    );

    expect(fetcher).toBeCalledTimes(1);
  });

  it('should return the same value when called inside deduping interval', async () => {
    const interval = 2000;
    const key = 'key-13434erdre';

    vi.useFakeTimers();

    const options: SWRComposableConfig = {
      ...defaultOptions,
      dedupingInterval: interval,
    };

    const result = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => {
        const { data: data1 } = useSWR(key, () => 'result1', options);
        const { data: data2 } = useSWR(key, () => 'result2', options);
        const { data: data3 } = useSWR(key, () => 'result3', options);
        const { data: data4 } = useSWR(key, () => 'result4', options);

        return [data1, data2, data3, data4];
      },
    );

    await flushPromises();
    expect(result.map((data) => data.value)).toEqual(['result1', 'result1', 'result1', 'result1']);
  });

  it('should call the fetcher function again when outside deduping interval', async () => {
    const interval = 2000;
    const key = 'key-1';
    const fetcher = vi.fn();

    vi.useFakeTimers();
    setDataToCache(key, { data: 'cachedData', fetchedIn: new Date() });

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => {
        vi.advanceTimersByTime(interval + 2);

        useSWR(key, fetcher, {
          ...defaultOptions,
          dedupingInterval: interval,
        });
      },
    );

    await flushPromises();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should change local data variable value when mutate resolves', async () => {
    setDataToCache(defaultKey, { data: 'cachedData' });

    const { mutate, data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, () => 'FetcherResult'),
    );

    expect(data.value).toEqual('cachedData');
    await mutate(() => 'newValue');

    expect(data.value).toEqual('newValue');
  });

  it('should change local data variable value when mutate is called with `optimistcData`', async () => {
    setDataToCache(defaultKey, { data: 'cachedData' });

    const { mutate, data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, () => 'FetcherResult'),
    );

    expect(data.value).toEqual('cachedData');

    mutate(() => 'newValue', { optimisticData: 'optimistcData' });
    expect(data.value).toEqual('optimistcData');
  });

  it('should update all hooks with the same key when call mutates', async () => {
    setDataToCache(defaultKey, { data: 'cachedData' });

    const { datas, mutate, differentData } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => {
        const { data: data1, mutate: localMutate } = useSWR(defaultKey, defaultFetcher);
        const { data: data2 } = useSWR(defaultKey, defaultFetcher);
        const { data: data3 } = useSWR(defaultKey, defaultFetcher);
        const { data: data4 } = useSWR(defaultKey, defaultFetcher);
        const { data: differentData1 } = useSWR('key-2', () => 'should not change');

        return {
          differentData: differentData1,
          datas: [data1, data2, data3, data4],
          mutate: localMutate,
        };
      },
    );

    expect(datas.map((data) => data.value)).toEqual([
      'cachedData',
      'cachedData',
      'cachedData',
      'cachedData',
    ]);

    await mutate(() => 'mutated value');
    expect(datas.map((data) => data.value)).toEqual([
      'mutated value',
      'mutated value',
      'mutated value',
      'mutated value',
    ]);

    expect(differentData.value).toEqual('should not change');
  });

  it('should call local and global onSuccess if fetcher successes', async () => {
    const onSuccess = vi.fn();
    const globalOnSuccess = vi.fn();
    const fetcherResult = 'result';

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, onSuccess: globalOnSuccess }),
      () => useSWR(defaultKey, () => fetcherResult, { onSuccess }),
    );

    await flushPromises();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith(fetcherResult, defaultKey, expect.anything());
    expect(globalOnSuccess).toHaveBeenCalledOnce();
    expect(globalOnSuccess).toHaveBeenCalledWith(fetcherResult, defaultKey, expect.anything());
  });

  it('should call local and global onError if fetcher throws', async () => {
    const onError = vi.fn();
    const globalOnError = vi.fn();
    const error = new Error();

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, onError: globalOnError }),
      () => useSWR(defaultKey, () => Promise.reject(error), { onError }),
    );

    await flushPromises();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(error, defaultKey, expect.anything());
    expect(globalOnError).toHaveBeenCalledOnce();
    expect(globalOnError).toHaveBeenCalledWith(error, defaultKey, expect.anything());
  });

  it('should call local and global onError and onSuccess with local and global configs merged', async () => {
    const onError = vi.fn();
    const globalOnError = vi.fn();
    const error = new Error();

    const localConfig: SWRComposableConfig = { dedupingInterval: 1 };
    const globalConfig: SWRComposableConfig = { revalidateOnFocus: false };
    const mergedConfig = { ...localConfig, ...globalConfig };

    useInjectedSetup(
      () => configureGlobalSWR({ ...globalConfig, cacheProvider, onError: globalOnError }),
      () => useSWR(defaultKey, () => Promise.reject(error), { ...localConfig, onError }),
    );

    await flushPromises();
    expect(onError).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining(mergedConfig),
    );
    expect(globalOnError).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining(mergedConfig),
    );
  });

  it('should return fallbackData as initial value', () => {
    const fallbackData = 'fallback';

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, defaultFetcher, { fallbackData }),
    );

    expect(data.value).toBe(fallbackData);
  });

  it('should return global fallbackData as initial value', () => {
    const fallbackData = 'fallback';

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, fallbackData }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    expect(data.value).toBe(fallbackData);
  });

  it('should return stale data fallbackData and stale data are present', async () => {
    const fallbackData = 'fallback';
    const cahedData = 'cached value';

    setDataToCache(defaultKey, { data: cahedData });

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, fallbackData }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    await flushPromises();
    expect(data.value).toBe(cahedData);
  });
});
