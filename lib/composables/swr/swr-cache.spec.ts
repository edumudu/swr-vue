import { nextTick, ref } from 'vue';

import { SWRComposableConfig } from '@/types';
import { mockedCache, useInjectedSetup } from '@/utils/test';
import { serializeKey } from '@/utils';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = mockedCache;
const defaultKey = 'defaultKey';
const defaultFetcher = vi.fn((key: string) => key);
const defaultOptions: SWRComposableConfig = { dedupingInterval: 0 };

describe('useSWR - Cache', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    cacheProvider.clear();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  it('should set an cache instance to key if not exists', async () => {
    const key = ref(defaultKey);
    const keyTwo = 'key-two';

    useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(key, defaultFetcher, defaultOptions),
    );

    expect(cacheProvider.has(serializeKey(key.value).key)).toBeTruthy();

    key.value = keyTwo;

    await nextTick();
    expect(cacheProvider.has(serializeKey(key.value).key)).toBeTruthy();
  });
});
