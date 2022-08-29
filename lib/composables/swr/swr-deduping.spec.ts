import { describe, expect, it, vi } from 'vitest';
import { reactive, ref, UnwrapRef } from 'vue';
import flushPromises from 'flush-promises';

import { CacheProvider, CacheState, Key, SWRComposableConfig } from '@/types';
import { useInjectedSetup } from '@/utils/test';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = reactive<CacheProvider>(new Map());
const defaultOptions: SWRComposableConfig = { dedupingInterval: 0 };

const setDataToCache = (key: Key, data: UnwrapRef<Partial<CacheState>>) => {
  cacheProvider.set(key, {
    error: ref(data.error),
    data: ref(data.data),
    isValidating: ref(data.isValidating || false),
    fetchedIn: ref(data.fetchedIn || new Date()),
  });
};

describe('SWR - Deduping', () => {
  it('should call the fetcher once if composables are called close of each other', () => {
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
});
