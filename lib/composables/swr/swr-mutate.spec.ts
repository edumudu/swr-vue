import { nextTick } from 'vue';

import { useInjectedSetup, setDataToMockedCache, mockedCache } from '@/utils/test';
import { globalState } from '@/config';

import { useSWR } from '.';
import { configureGlobalSWR, useSWRConfig } from '../global-swr-config';

const cacheProvider = mockedCache;
const defaultKey = 'defaultKey';
const defaultFetcher = vi.fn((key: string) => key);

const setTimeoutPromise = (ms: number, resolveTo: unknown) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(resolveTo), ms);
  });

const useSWRWrapped: typeof useSWR = (...params) => {
  return useInjectedSetup(
    () => configureGlobalSWR({ cacheProvider, dedupingInterval: 0 }),
    () => useSWR(...params),
  );
};

describe('useSWR - mutate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    cacheProvider.clear();
    globalState.delete(cacheProvider);

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should change local data variable value when mutate resolves', async () => {
    const { mutate, data } = useSWRWrapped(defaultKey, () => 'FetcherResult');

    await nextTick();
    expect(data.value).toEqual('FetcherResult');

    await mutate(() => 'newValue', { revalidate: false });
    await nextTick();
    expect(data.value).toEqual('newValue');
  });

  it('should change local data variable value when mutate is called with `optimistcData`', async () => {
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

    const { mutate, data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, () => 'FetcherResult'),
    );

    expect(data.value).toEqual('cachedData');

    mutate(() => setTimeoutPromise(1000, 'newValue'), { optimisticData: 'optimistcData' });
    await nextTick();
    expect(data.value).toEqual('optimistcData');
  });

  it('should update all hooks with the same key when call mutates', async () => {
    setDataToMockedCache(defaultKey, { data: 'cachedData' });

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

  it('should trigger revalidation programmatically', async () => {
    let value = 0;

    const { mutate, data, globalMutate } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => {
        const { mutate: localGlobalMutate } = useSWRConfig();
        // eslint-disable-next-line no-plusplus
        const swrResult = useSWR(defaultKey, () => value++, { dedupingInterval: 0 });

        return {
          globalMutate: localGlobalMutate,
          ...swrResult,
        };
      },
    );

    await nextTick();
    expect(data.value).toEqual(0);

    await mutate();

    await nextTick();
    expect(data.value).toEqual(1);

    await globalMutate(defaultKey);

    await nextTick();
    expect(data.value).toEqual(2);
  });
});
