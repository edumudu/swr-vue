import { computed, readonly, watch, toRefs, toRef, unref, Ref } from 'vue';
import { toReactive, useEventListener, useIntervalFn } from '@vueuse/core';

import type { OmitFirstArrayIndex, SWRComposableConfig, SWRFetcher, SWRKey } from '@/types';
import { serializeKey } from '@/utils';
import { mergeConfig } from '@/utils/merge-config';
import { useSWRConfig } from '@/composables/global-swr-config';

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

  const error: Ref<Error | undefined> = toRef(valueInCache.value || { error: undefined }, 'error');
  const data: Ref<Data | undefined> = toRef(valueInCache.value || { data: fallbackValue }, 'data');
  const isValidating = toRef(valueInCache.value || { isValidating: true }, 'isValidating');
  const fetchedIn = toRef(valueInCache.value || { fetchedIn: new Date() }, 'fetchedIn');

  const fetchData = async () => {
    const timestampToDedupExpire = (fetchedIn.value?.getTime() || 0) + dedupingInterval;

    if (hasCachedValue.value && timestampToDedupExpire > Date.now()) return;

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

  if (revalidateOnFocus && (revalidateIfStale || !data.value)) {
    useEventListener(window, 'focus', onWindowFocus);
  }

  if (revalidateOnReconnect && (revalidateIfStale || !data.value)) {
    useEventListener(window, 'online', () => fetchData());
  }

  if (refreshInterval) {
    useIntervalFn(onRefresh, refreshInterval);
  }

  watch(valueInCache, (newValueInCache) => {
    data.value = newValueInCache?.data;
    error.value = newValueInCache?.error;
    isValidating.value = newValueInCache?.isValidating ?? isValidating.value;
    fetchedIn.value = newValueInCache?.fetchedIn ?? fetchedIn.value;
  });

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
      error,
      data,
      isValidating,
      fetchedIn,
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
