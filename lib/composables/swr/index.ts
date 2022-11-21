import { computed, shallowReadonly, watch, toRefs, unref, customRef, onUnmounted } from 'vue';
import {
  createUnrefFn,
  toReactive,
  useIntervalFn,
  useNetwork,
  whenever,
  useWindowFocus,
} from '@vueuse/core';

import type {
  CacheProvider,
  CacheState,
  MaybeRef,
  OmitFirstArrayIndex,
  RevalidatorOpts,
  SWRComposableConfig,
  SWRConfig,
  SWRFetcher,
  SWRKey,
} from '@/types';
import { isUndefined, serializeKey, subscribeCallback } from '@/utils';
import { mergeConfig } from '@/utils/merge-config';
import { useSWRConfig } from '@/composables/global-swr-config';
import { useScopeState } from '@/composables/scope-state';

type RefCachedOptions = {
  cacheProvider: CacheProvider;
  key: MaybeRef<string>;
  stateKey: keyof CacheState;
};

const setStateToCache = (key: string, cache: CacheProvider, state: Partial<CacheState>) => {
  cache.set(key, {
    data: undefined,
    error: undefined,
    fetchedIn: new Date(),
    isValidating: false,
    ...state,
  });
};

const refCached = <T>(initialValue: T, { cacheProvider, stateKey, key }: RefCachedOptions) => {
  const cacheState = computed(() => cacheProvider.get(unref(key)));

  return customRef<T>((track, trigger) => ({
    get() {
      track();
      return cacheState.value?.[stateKey] ?? initialValue;
    },
    set(newValue) {
      // This also will create a state to new keys
      setStateToCache(unref(key), cacheProvider, {
        ...cacheState.value,
        [stateKey]: newValue,
      });

      trigger();
    },
  }));
};

const getFromFallback = createUnrefFn((key: string, fallback: SWRConfig['fallback']) => {
  if (!fallback) return undefined;

  const findedKey = Object.keys(fallback).find((_key) => serializeKey(_key).key === key);

  return findedKey && fallback[findedKey];
});

export const useSWR = <Data = any, Error = any>(
  _key: SWRKey,
  fetcher: SWRFetcher<Data>,
  config: SWRComposableConfig = {},
) => {
  const { config: contextConfig, mutate } = useSWRConfig();
  const { revalidateCache } = useScopeState(contextConfig.value.cacheProvider);
  const { isOnline } = useNetwork();
  const isWindowFocused = useWindowFocus();

  const mergedConfig = mergeConfig(contextConfig.value, config);

  const {
    cacheProvider,
    revalidateOnFocus,
    revalidateOnReconnect,
    revalidateIfStale,
    dedupingInterval,
    fallback,
    fallbackData,
    focusThrottleInterval,
    refreshInterval,
    refreshWhenHidden,
    refreshWhenOffline,
    onSuccess,
    onError,
  } = mergedConfig;

  const { key, args: fetcherArgs } = toRefs(toReactive(computed(() => serializeKey(_key))));
  const fallbackValue = isUndefined(fallbackData) ? getFromFallback(key, fallback) : fallbackData;

  const valueInCache = computed(() => cacheProvider.get(key.value));
  const hasCachedValue = computed(() => !!valueInCache.value);

  const data = refCached<Data | undefined>(fallbackValue, { cacheProvider, stateKey: 'data', key });
  const error = refCached<Error | undefined>(undefined, { cacheProvider, stateKey: 'error', key });
  const isValidating = refCached(true, { cacheProvider, stateKey: 'isValidating', key });
  const fetchedIn = refCached(new Date(), { cacheProvider, stateKey: 'fetchedIn', key });

  const fetchData = async (opts: RevalidatorOpts = { dedup: true }) => {
    const timestampToDedupExpire = (fetchedIn.value?.getTime() || 0) + dedupingInterval;
    const hasNotExpired = timestampToDedupExpire > Date.now();

    // Dedup requets
    if (
      opts.dedup &&
      hasCachedValue.value &&
      (hasNotExpired || (isValidating.value && dedupingInterval !== 0))
    )
      return;

    isValidating.value = true;

    try {
      const fetcherResponse = await fetcher.apply(fetcher, fetcherArgs.value);

      data.value = fetcherResponse;
      fetchedIn.value = new Date();

      if (onSuccess) onSuccess(data.value, key.value, mergedConfig);
    } catch (err: any) {
      error.value = err;

      if (onError) onError(err, key.value, mergedConfig);
    } finally {
      isValidating.value = false;
    }
  };

  let unsubRevalidateCb: ReturnType<typeof subscribeCallback> | undefined;

  const onRefresh = () => {
    const shouldSkipRefreshOffline = !refreshWhenOffline && !isOnline.value;
    const shouldSkipRefreshHidden = !refreshWhenHidden && document.visibilityState === 'hidden';

    if (shouldSkipRefreshOffline || shouldSkipRefreshHidden) return;

    fetchData();
  };

  const onWindowFocus = () => {
    const fetchedInTimestamp = fetchedIn.value?.getTime() || 0;

    if (fetchedInTimestamp + focusThrottleInterval > Date.now()) return;

    fetchData();
  };

  const onRevalidate = async () => {
    if (!key.value) {
      return;
    }

    // Skip dedup when trigger by mutate
    await fetchData({ dedup: false });
  };

  const onKeyChange = (newKey: string, oldKey?: string) => {
    if (!!newKey && newKey !== oldKey && (revalidateIfStale || !data.value)) {
      fetchData();
    }

    unsubRevalidateCb?.();

    subscribeCallback(newKey, onRevalidate, revalidateCache.value);
  };

  if (refreshInterval) {
    useIntervalFn(onRefresh, refreshInterval);
  }

  whenever(
    () => revalidateOnFocus && (revalidateIfStale || !data.value) && isWindowFocused.value,
    () => onWindowFocus(),
  );

  whenever(
    () => revalidateOnReconnect && (revalidateIfStale || !data.value) && isOnline.value,
    () => fetchData(),
  );

  watch(key, onKeyChange, { immediate: true });
  onUnmounted(() => unsubRevalidateCb?.());

  if (!hasCachedValue.value) {
    setStateToCache(key.value, cacheProvider, {
      error: error.value,
      data: data.value,
      isValidating: isValidating.value,
      fetchedIn: fetchedIn.value,
    });
  }

  return {
    data: shallowReadonly(data),
    error: shallowReadonly(error),
    isValidating: shallowReadonly(isValidating),
    mutate: (...params: OmitFirstArrayIndex<Parameters<typeof mutate>>) =>
      mutate(unref(_key), ...params),
  };
};
