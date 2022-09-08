import { isRef, nextTick, ref } from 'vue';
import flushPromises from 'flush-promises';

import { withSetup } from '@/utils/with-setup';
import { SWRComposableConfig } from '@/types';
import { useInjectedSetup, setDataToMockedCache, mockedCache, dispatchEvent } from '@/utils/test';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = mockedCache;
const defaultKey = 'defaultKey';
const defaultFetcher = vi.fn((key: string) => key);
const defaultOptions: SWRComposableConfig = { dedupingInterval: 0 };

const setTimeoutPromise = (ms: number, resolveTo: unknown) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(resolveTo), ms);
  });

describe('useSWR', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    cacheProvider.clear();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
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

  it('should set the same error in different `useSWR` calls with the same key', async () => {
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
    expect(error2.value).toBeInstanceOf(Error);
    expect(error1.value).toBeInstanceOf(Error);
    expect(error1.value).toBe(error2.value);
  });

  it('should return cached value first then revalidate', async () => {
    setDataToMockedCache(defaultKey, {
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
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

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
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

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
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

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
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

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
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

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
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

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

  it('should not refresh if refreshInterval = 0', async () => {
    const fetcher = vi.fn(defaultFetcher);

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, fetcher, { ...defaultOptions, refreshInterval: 0 }),
    );

    await flushPromises();
    expect(fetcher).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(10000);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('should refresh in refreshInterval time span', async () => {
    const fetcher = vi.fn(defaultFetcher);
    const refreshInterval = 2000;

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, fetcher, { ...defaultOptions, refreshInterval }),
    );

    await flushPromises();
    expect(fetcher).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(refreshInterval / 2);
    expect(fetcher).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(refreshInterval / 2);
    expect(fetcher).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(refreshInterval * 3);
    expect(fetcher).toHaveBeenCalledTimes(5);
  });

  it('should not refresh when offline and refreshWhenOffline = false', async () => {
    const fetcher = vi.fn(defaultFetcher);
    const refreshInterval = 2000;

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () =>
        useSWR(defaultKey, fetcher, {
          ...defaultOptions,
          refreshInterval,
          refreshWhenOffline: false,
        }),
    );

    await flushPromises();
    expect(fetcher).toHaveBeenCalledOnce();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    vi.advanceTimersByTime(refreshInterval * 3);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('should refresh when offline and refreshWhenOffline = true', async () => {
    const fetcher = vi.fn(defaultFetcher);
    const refreshInterval = 2000;

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () =>
        useSWR(defaultKey, fetcher, {
          ...defaultOptions,
          refreshInterval,
          refreshWhenOffline: true,
        }),
    );

    await flushPromises();
    expect(fetcher).toHaveBeenCalledOnce();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    vi.advanceTimersByTime(refreshInterval * 3);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it('should not refresh when window is hidden and refreshWhenHidden = false', async () => {
    const fetcher = vi.fn(defaultFetcher);
    const refreshInterval = 2000;

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () =>
        useSWR(defaultKey, fetcher, {
          ...defaultOptions,
          refreshInterval,
          refreshWhenHidden: false,
        }),
    );

    await flushPromises();
    expect(fetcher).toHaveBeenCalledOnce();

    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    vi.advanceTimersByTime(refreshInterval * 3);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('should refresh when window is hidden and refreshWhenHidden = true', async () => {
    const fetcher = vi.fn(defaultFetcher);
    const refreshInterval = 2000;

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () =>
        useSWR(defaultKey, fetcher, {
          ...defaultOptions,
          refreshInterval,
          refreshWhenHidden: true,
        }),
    );

    await flushPromises();
    expect(fetcher).toHaveBeenCalledOnce();

    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    vi.advanceTimersByTime(refreshInterval * 3);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
});
