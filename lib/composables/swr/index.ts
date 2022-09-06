import { computed, readonly, watch, toRefs, unref, customRef } from 'vue';
import { toReactive, useEventListener, useIntervalFn } from '@vueuse/core';

import type {
  MaybeRef,
  OmitFirstArrayIndex,
  SWRComposableConfig,
  SWRFetcher,
  SWRKey,
} from '@/types';
import { serializeKey } from '@/utils';
import { mergeConfig } from '@/utils/merge-config';
import { isClient } from '@/config';
import { useSWRConfig } from '@/composables/global-swr-config';

type UseCachedRefOptions = {
  cache: any;
  key: MaybeRef<string>;
  stateKey: string;
};

const useCachedRef = <T>(initialValue: T, { cache, stateKey, key }: UseCachedRefOptions) => {
  const cacheStete = computed(() => cache.get(unref(key)));

  return customRef<T>((track, trigger) => {
    return {
      get() {
        track();
        return cacheStete.value?.[stateKey] ?? initialValue;
      },
      set(newValue) {
        cache.set(unref(key), {
          ...cacheStete.value,
          [stateKey]: newValue,
        });
        trigger();
      },
    };
  });
};

export const useSWR = <Data = any, Error = any>(
  _key: SWRKey,
  fetcher: SWRFetcher<Data>,
  config: SWRComposableConfig = {},
) => {
  const { config: contextConfig, mutate } = useSWRConfig();
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

  const { key, args: fetcherArgs } = toRefs(toReactive(computed(() => serializeKey(unref(_key)))));
  const fallbackValue = fallbackData === undefined ? fallback?.[key.value] : fallbackData;

  const valueInCache = computed(() => cacheProvider.get(key.value));
  const hasCachedValue = computed(() => !!valueInCache.value);

  /* eslint-disable max-len, prettier/prettier */
  const data = useCachedRef<Data>(valueInCache.value?.data ?? fallbackValue, { cache: cacheProvider, stateKey: 'data', key });
  const error = useCachedRef<Error>(valueInCache.value?.error, { cache: cacheProvider, stateKey: 'error', key });
  const isValidating = useCachedRef(valueInCache.value?.isValidating ?? true, { cache: cacheProvider, stateKey: 'isValidating', key });
  const fetchedIn = useCachedRef(valueInCache.value?.fetchedIn ?? new Date(), { cache: cacheProvider, stateKey: 'fetchedIn', key });
  /* eslint-enable */

  const fetchData = async () => {
    const timestampToDedupExpire = (fetchedIn.value?.getTime() || 0) + dedupingInterval;
    const hasExpired = timestampToDedupExpire > Date.now();

    if (hasCachedValue.value && (hasExpired || (isValidating.value && dedupingInterval !== 0)))
      return;

    isValidating.value = true;

    try {
      const fetcherResponse = await fetcher.apply(
        fetcher,
        Array.isArray(fetcherArgs.value) ? fetcherArgs.value : [fetcherArgs.value],
      );

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

  const onRefresh = () => {
    const shouldSkipRefreshOffline = !refreshWhenOffline && !navigator.onLine;
    const shouldSkipRefreshHidden = !refreshWhenHidden && document.visibilityState === 'hidden';

    if (shouldSkipRefreshOffline || shouldSkipRefreshHidden) return;

    fetchData();
  };

  const onWindowFocus = () => {
    const fetchedInTimestamp = fetchedIn.value?.getTime() || 0;

    if (fetchedInTimestamp + focusThrottleInterval > Date.now()) return;

    fetchData();
  };

  if (isClient && revalidateOnFocus && (revalidateIfStale || !data.value)) {
    useEventListener(window, 'focus', onWindowFocus);
  }

  if (isClient && revalidateOnReconnect && (revalidateIfStale || !data.value)) {
    useEventListener(window, 'online', () => fetchData());
  }

  if (refreshInterval) {
    useIntervalFn(onRefresh, refreshInterval);
  }

  watch(
    key,
    (newKey, oldKey) => {
      if (!!newKey && newKey !== oldKey && (revalidateIfStale || !data.value)) {
        fetchData();
      }
    },
    { immediate: true },
  );

  if (!hasCachedValue.value) {
    cacheProvider.set(key.value, {
      error: error.value,
      data: data.value,
      isValidating: isValidating.value,
      fetchedIn: fetchedIn.value,
    });
  }

  return {
    data: readonly(data),
    error: readonly(error),
    isValidating: readonly(isValidating),
    mutate: (...params: OmitFirstArrayIndex<Parameters<typeof mutate>>) =>
      mutate(key.value, ...params),
  };
};
