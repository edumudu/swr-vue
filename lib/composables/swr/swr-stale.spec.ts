import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, reactive, ref, UnwrapRef, watch } from 'vue';
import flushPromises from 'flush-promises';

import { CacheProvider, CacheState, Key, SWRComposableConfig } from '@/types';
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
    isValidating: ref(data.isValidating || false),
    fetchedIn: ref(data.fetchedIn || new Date()),
  });
};

const setTimeoutPromise = (ms: number, resolveTo: unknown) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(resolveTo), ms);
  });

describe('useSWR - Stale', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    cacheProvider.clear();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  it('should return cached value before fullfill fetcher', async () => {
    vi.useFakeTimers();
    setDataToCache(defaultKey, { data: 'cachedData' });

    const fetcher = vi.fn(() => setTimeoutPromise(1000, 'FetcherResult'));

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, fetcher, defaultOptions),
    );

    expect(data.value).toBe('cachedData');
    await flushPromises();
    expect(data.value).toBe('cachedData');
  });

  it('should return new key cached value', async () => {
    const key = ref('key');
    const keyTwo = 'key-two';

    vi.useFakeTimers();
    setDataToCache(key.value, { data: 'cachedData' });
    setDataToCache(keyTwo, { data: 'cachedDataKeyTwo' });

    const fetcher = vi.fn(() => setTimeoutPromise(1000, 'FetcherResult'));

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(() => key.value, fetcher, defaultOptions),
    );

    expect(data.value).toBe('cachedData');

    key.value = keyTwo;
    await nextTick();
    expect(data.value).toBe('cachedDataKeyTwo');
  });

  it('should return default value and return stale data when key changes', async () => {
    const key = ref('key');
    const keyTwo = 'key-two';

    vi.useFakeTimers();
    setDataToCache(keyTwo, { data: 'cachedData' });

    const fetcher = vi.fn(() => setTimeoutPromise(1000, 'FetcherResult'));

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(key, fetcher, defaultOptions),
    );

    expect(data.value).toBeUndefined();

    key.value = keyTwo;
    await nextTick();
    expect(data.value).toBe('cachedData');
  });

  it('should change variables values when key change in an rastreable way', async () => {
    const key = ref('');
    const keyTwo = 'key-two';

    const newData = 'test';
    const newErrr = new Error();

    setDataToCache(keyTwo, { data: newData, error: newErrr });

    const { data, error } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(key, () => new Promise(() => {}), defaultOptions),
    );

    const onDataChange = vi.fn();
    const onErrorChange = vi.fn();

    expect(cacheProvider.has(key.value)).toBeTruthy();
    expect(data.value).toBeUndefined();

    watch(data, onDataChange);
    watch(error, onErrorChange);

    key.value = keyTwo;

    await nextTick();
    expect(onDataChange).toHaveBeenCalledTimes(1);
    expect(onDataChange).toHaveBeenCalledWith(newData, undefined, expect.anything());
    expect(onErrorChange).toHaveBeenCalledTimes(1);
    expect(onErrorChange).toHaveBeenCalledWith(newErrr, undefined, expect.anything());
  });

  it.each([
    'fallback',
    'Lorem ispum dolor sit amet',
    100,
    ['item1', 'item2'],
    { a: 1, b: '' },
    null,
  ])('should return fallbackData "%s" as initial value', (fallbackData) => {
    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, defaultFetcher, { fallbackData }),
    );

    expect(data.value).toEqual(fallbackData);
  });

  it('should return global fallbackData as initial value', () => {
    const fallbackData = 'fallback';

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, fallbackData }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    expect(data.value).toBe(fallbackData);
  });

  it('should return stale data if fallbackData and stale data are present', async () => {
    const fallbackData = 'fallback';
    const cachedData = 'cached value';

    setDataToCache(defaultKey, { data: cachedData });

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, fallbackData }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    expect(data.value).toBe(cachedData);
  });

  it.each([
    'fallback',
    'Lorem ispum dolor sit amet',
    100,
    ['item1', 'item2'],
    { a: 1, b: '' },
    null,
  ])('should return data "%s" in fallback as initial value', (fallbackData) => {
    const fallback = { [defaultKey]: fallbackData };

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, defaultFetcher, { fallback }),
    );

    expect(data.value).toEqual(fallbackData);
  });

  it('should return data in global fallback as initial value', () => {
    const fallback = { [defaultKey]: 'fallback' };

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, fallback }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    expect(data.value).toBe('fallback');
  });

  it('should return stale data if fallback and stale data are present', async () => {
    const fallback = { [defaultKey]: 'fallback' };
    const cachedValue = 'cached value';

    setDataToCache(defaultKey, { data: cachedValue });

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, fallback }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    await flushPromises();
    expect(data.value).toBe(cachedValue);
  });

  it('should give priority to fallbackData over fallback as initial value', () => {
    const fallback = { [defaultKey]: 'fallback' };
    const fallbackData = 'fallbackData';

    const { data } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider, fallback, fallbackData }),
      () => useSWR(defaultKey, defaultFetcher),
    );

    expect(data.value).toBe(fallbackData);
  });
});
