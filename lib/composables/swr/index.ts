import { computed, ref, reactive, readonly, watch, toRefs, toRef } from 'vue';
import { toReactive, useEventListener } from '@vueuse/core';

import type { SWRConfig, SWRFetcher, SWRKey } from '@/types';
import { serializeKey } from '@/utils';
import { mergeConfig } from '@/utils/merge-config';
import { useSWRConfig } from '@/composables/global-swr-config';

export const useSWR = <Data = any, Error = any>(
  _key: SWRKey,
  fetcher: SWRFetcher<Data>,
  config: SWRConfig = {},
) => {
  const { config: contextConfig, mutate } = useSWRConfig();

  const {
    cacheProvider,
    revalidateOnFocus,
    revalidateOnReconnect,
    revalidateIfStale,
    dedupingInterval,
  } = mergeConfig(contextConfig.value, config);

  const { key, args: fetcherArgs } = toRefs(toReactive(computed(() => serializeKey(_key))));

  const valueInCache = computed(() => cacheProvider.get(key.value));
  const hasCachedValue = computed(() => !!valueInCache.value);

  const error = hasCachedValue.value ? toRef(valueInCache.value, 'error') : ref<Error>();
  const isValidating = hasCachedValue.value ? toRef(valueInCache.value, 'isValidating') : ref(true);
  const data = hasCachedValue.value ? toRef(valueInCache.value, 'data') : ref();
  const fetchedIn = hasCachedValue.value ? toRef(valueInCache.value, 'fetchedIn') : ref(new Date());

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
    } catch (err: any) {
      error.value = err;
    } finally {
      isValidating.value = false;
    }
  };

  if (revalidateOnFocus && (revalidateIfStale || !data.value)) {
    useEventListener(window, 'focus', () => fetchData());
  }

  if (revalidateOnReconnect && (revalidateIfStale || !data.value)) {
    useEventListener(window, 'online', () => fetchData());
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
      error,
      isValidating,
      data,
      fetchedIn,
    });
  }

  return {
    data: readonly(data),
    error: readonly(error),
    isValidating: readonly(isValidating),
    mutate: (newValue: Data) => mutate(key.value, newValue),
  };
};
