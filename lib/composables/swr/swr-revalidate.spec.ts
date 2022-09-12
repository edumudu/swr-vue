import flushPromises from 'flush-promises';
import { nextTick } from 'vue';

import { SWRComposableConfig } from '@/types';
import {
  useInjectedSetup,
  mockedCache,
  setDataToMockedCache,
  dispatchEvent,
  useSetup,
} from '@/utils/test';
import { globalState } from '@/config';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = mockedCache;
const defaultKey = 'defaultKey';
const defaultFetcher = vi.fn((key: string) => key);
const defaultOptions: SWRComposableConfig = { dedupingInterval: 0 };

const useSWRWrapped: typeof useSWR = (...params) => {
  return useInjectedSetup(
    () => configureGlobalSWR({ cacheProvider }),
    () => useSWR(...params),
  );
};

describe('useSWR - Revalidate', () => {
  beforeEach(() => {
    cacheProvider.clear();
    globalState.delete(cacheProvider);

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  it('should return cached value first then revalidate', async () => {
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('FetcherResult'), 1000);
        }),
    );

    const { data: swrData } = useSWRWrapped(defaultKey, fetcher, defaultOptions);

    expect(swrData.value).toBe('cachedData');

    vi.advanceTimersByTime(1000);
    await flushPromises();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(swrData.value).toBe('FetcherResult');
  });

  describe('focus', () => {
    const dispatchWindowFocus = async () => {
      dispatchEvent('blur', window);
      await nextTick();

      dispatchEvent('focus', window);
      await nextTick();
    };

    it('should revalidate when focus page', async () => {
      setDataToMockedCache(defaultKey, { data: 'cachedData' });

      const fetcher = vi.fn().mockResolvedValue('FetcherResult');
      const { data } = useSWRWrapped(defaultKey, fetcher, {
        dedupingInterval: 0,
        focusThrottleInterval: 0,
      });

      fetcher.mockClear();

      await dispatchWindowFocus();
      await flushPromises();

      expect(fetcher).toBeCalledTimes(1);
      expect(data.value).toBe('FetcherResult');
    });

    it('should revalidate on focus just once inside focusThrottleInterval time span', async () => {
      setDataToMockedCache(defaultKey, { data: 'cachedData' });

      const focusThrottleInterval = 4000;
      const fetcher = vi.fn(defaultFetcher);

      useSWRWrapped(defaultKey, fetcher, {
        focusThrottleInterval,
        revalidateOnFocus: true,
      });

      await nextTick();
      fetcher.mockClear();

      await dispatchWindowFocus();
      expect(fetcher).toBeCalledTimes(0);

      vi.advanceTimersByTime(focusThrottleInterval - 1);
      await dispatchWindowFocus();
      expect(fetcher).toBeCalledTimes(0);

      vi.advanceTimersByTime(2);
      await dispatchWindowFocus();
      expect(fetcher).toBeCalledTimes(1);

      await flushPromises();
      vi.advanceTimersByTime(focusThrottleInterval - 1);
      await dispatchWindowFocus();
      expect(fetcher).toBeCalledTimes(1);
    });

    it('should not revalidate when focus if config revalidateOnFocus is false', async () => {
      setDataToMockedCache(defaultKey, { data: 'cachedData' });

      const fetcher = vi.fn().mockResolvedValue('FetcherResult');
      const { data } = useSWRWrapped(defaultKey, fetcher, {
        ...defaultOptions,
        revalidateOnFocus: false,
      });

      await dispatchWindowFocus();
      await flushPromises();

      expect(fetcher).toBeCalledTimes(1);
      expect(data.value).toBe('FetcherResult');
    });

    it('should remove focus listeners when unmount component', async () => {
      const fetcher = vi.fn(defaultFetcher);
      const instance = useSetup(() => useSWR(defaultKey, fetcher, { revalidateOnFocus: true }));

      await nextTick();
      fetcher.mockClear();

      vi.advanceTimersByTime(10_000);

      instance.unmount();
      await dispatchWindowFocus();

      expect(fetcher).not.toHaveBeenCalled();
    });
  });

  it('should not revalidate if revalidateIfStale is false', async () => {
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const { data } = useSWRWrapped(defaultKey, fetcher, {
      ...defaultOptions,
      revalidateIfStale: false,
    });

    await flushPromises();
    expect(fetcher).toBeCalledTimes(0);
    expect(data.value).toBe('cachedData');
  });

  it('should revalidate when back online', async () => {
    let value = 1;

    // eslint-disable-next-line no-plusplus
    const fetcher = vi.fn(() => Promise.resolve(value++));

    const { data } = useSWRWrapped(defaultKey, fetcher, defaultOptions);

    await flushPromises();
    fetcher.mockClear();
    expect(data.value).toBe(1);

    // Go offline
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    dispatchEvent('offline', window);

    // Go online
    await nextTick();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    dispatchEvent('online', window);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(1);
    expect(data.value).toBe(2);
  });

  it('should not revalidate when back online if config revalidateOnReconnect is false', async () => {
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const { data } = useSWRWrapped(defaultKey, fetcher, {
      ...defaultOptions,
      revalidateOnReconnect: false,
    });

    dispatchEvent('online', document);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(1);
    expect(data.value).toBe('FetcherResult');
  });
});
