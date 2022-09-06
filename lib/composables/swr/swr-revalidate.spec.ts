import flushPromises from 'flush-promises';

import { SWRComposableConfig } from '@/types';
import { useInjectedSetup, mockedCache, setDataToMockedCache, dispatchEvent } from '@/utils/test';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = mockedCache;
const defaultKey = 'defaultKey';
const defaultFetcher = vi.fn((key: string) => key);
const defaultOptions: SWRComposableConfig = { dedupingInterval: 0 };

describe('useSWR - Revalidate', () => {
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
});
