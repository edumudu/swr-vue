import { nextTick, ref } from 'vue';

import { SWRComposableConfig } from '@/types';
import { useInjectedSetup, mockedCache } from '@/utils/test';
import { serializeKey } from '@/utils';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = mockedCache;
const defaultKey = 'defaultKey';
const { key: defaultKeySerialized } = serializeKey(defaultKey);

describe('useSWR', () => {
  beforeEach(() => {
    cacheProvider.clear();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  it('should call local and global onSuccess if fetcher successes', async () => {
    const onSuccess = vi.fn();
    const globalOnSuccess = vi.fn();
    const fetcherResult = 'result';

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, onSuccess: globalOnSuccess }),
      () => useSWR(defaultKey, () => fetcherResult, { onSuccess }),
    );

    await nextTick();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith(fetcherResult, defaultKeySerialized, expect.anything());
    expect(globalOnSuccess).toHaveBeenCalledOnce();
    expect(globalOnSuccess).toHaveBeenCalledWith(
      fetcherResult,
      defaultKeySerialized,
      expect.anything(),
    );
  });

  it('should call local and global onError if fetcher throws', async () => {
    const onError = vi.fn();
    const globalOnError = vi.fn();
    const error = new Error();

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, onError: globalOnError }),
      () => useSWR(defaultKey, () => Promise.reject(error), { onError }),
    );

    await nextTick();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(error, defaultKeySerialized, expect.anything());
    expect(globalOnError).toHaveBeenCalledOnce();
    expect(globalOnError).toHaveBeenCalledWith(error, defaultKeySerialized, expect.anything());
  });

  it('should call local and global onError with local and global configs merged', async () => {
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

    await nextTick();
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

  it('should call local and global onSuccess with local and global configs merged', async () => {
    const onSuccess = vi.fn();
    const globalOnSuccess = vi.fn();

    const localConfig: SWRComposableConfig = { dedupingInterval: 1 };
    const globalConfig: SWRComposableConfig = { revalidateOnFocus: false };
    const mergedConfig = { ...localConfig, ...globalConfig };

    useInjectedSetup(
      () => configureGlobalSWR({ ...globalConfig, cacheProvider, onSuccess: globalOnSuccess }),
      () => useSWR(defaultKey, () => Promise.resolve('resolved'), { ...localConfig, onSuccess }),
    );

    await nextTick();
    expect(onSuccess).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining(mergedConfig),
    );
    expect(globalOnSuccess).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining(mergedConfig),
    );
  });

  it.each(['key-ref', 'key-string'])(
    'should call local and global onSuccess with right key "%s" and data',
    async (keyStr) => {
      const key = keyStr === 'key-ref' ? ref(keyStr) : keyStr;
      const { key: serializedKey } = serializeKey(key);
      const onSuccess = vi.fn();
      const globalOnSuccess = vi.fn();
      const resolvedData = 'resolved :)';

      useInjectedSetup(
        () => configureGlobalSWR({ cacheProvider, onSuccess: globalOnSuccess }),
        () => useSWR(key, () => Promise.resolve(resolvedData), { onSuccess }),
      );

      await nextTick();
      expect(onSuccess).toHaveBeenCalledWith(resolvedData, serializedKey, expect.anything());
      expect(globalOnSuccess).toHaveBeenCalledWith(resolvedData, serializedKey, expect.anything());
    },
  );

  it.each(['key-ref', 'key-string'])(
    'should call local and global onError with right key "%s" and error',
    async (keyStr) => {
      const key = keyStr === 'key-ref' ? ref(keyStr) : keyStr;
      const { key: serializedKey } = serializeKey(key);
      const onError = vi.fn();
      const globalOnError = vi.fn();
      const error = new Error('fetch failed :(');

      useInjectedSetup(
        () => configureGlobalSWR({ cacheProvider, onError: globalOnError }),
        () => useSWR(key, () => Promise.reject(error), { onError }),
      );

      await nextTick();
      expect(onError).toHaveBeenCalledWith(error, serializedKey, expect.anything());
      expect(globalOnError).toHaveBeenCalledWith(error, serializedKey, expect.anything());
    },
  );
});
