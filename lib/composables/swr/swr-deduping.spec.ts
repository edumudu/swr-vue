import { ref, nextTick } from 'vue';

import { SWRComposableConfig } from '@/types';
import { useInjectedSetup, mockedCache, setDataToMockedCache } from '@/utils/test';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = mockedCache;
const defaultOptions: SWRComposableConfig = { dedupingInterval: 0 };

describe('useSWR - Deduping', () => {
  beforeEach(() => {
    cacheProvider.clear();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

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

  it('should dedup also when already has cache', async () => {
    const interval = 2000;
    const key = ref('key-1');
    const fetcher = vi.fn();

    setDataToMockedCache(key.value, { data: 'cachedData', fetchedIn: new Date(Date.now() - 4000) });

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

    expect(fetcher).toHaveBeenCalledTimes(1);

    key.value = 'key-2';
    await nextTick();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should return the same value when called inside deduping interval', async () => {
    const interval = 2000;
    const key = 'key-13434erdre';

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

    await nextTick();
    expect(result.map((data) => data.value)).toEqual(['result1', 'result1', 'result1', 'result1']);
  });

  it('should call the fetcher function again when outside deduping interval', async () => {
    const interval = 2000;
    const key = 'key-1';
    const fetcher = vi.fn();

    setDataToMockedCache(key, { data: 'cachedData' });
    vi.advanceTimersByTime(interval);

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => {
        useSWR(key, fetcher, {
          ...defaultOptions,
          dedupingInterval: interval,
        });
      },
    );

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should disable deduping if `dedupingInterval` equals 0', () => {
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
