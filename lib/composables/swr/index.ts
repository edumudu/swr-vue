import { computed, ref, reactive, readonly, watch, toRefs } from 'vue';
import { toReactive, useEventListener } from '@vueuse/core';

import type { SWRConfig, SWRFetcher, SWRKey } from '@/types';
import { serializeKey } from '@/utils';
import { mergeConfig } from '@/utils/merge-config';
import { MapAdapter } from '@/cache';
import { useGlobalSWRConfig } from '@/composables/global-swr-config';

const cache = reactive(new MapAdapter());

export const mutateGlobal = (key: string, value: any) => {
  cache.set(key, value);
};

export const useSWR = <Data = any, Error = any>(
  _key: SWRKey,
  fetcher: SWRFetcher<Data>,
  config: SWRConfig = {},
) => {
  const { globalConfig } = useGlobalSWRConfig();

  const {
    cacheProvider = cache,
    revalidateOnFocus,
    revalidateOnReconnect,
    revalidateIfStale,
  } = mergeConfig(globalConfig.value, config);

  const { key, args: fetcherArgs } = toRefs(toReactive(computed(() => serializeKey(_key))));
  const error = ref<Error>();
  const isValidating = ref(true);
  const data = computed<Data>({
    get: () => cacheProvider.get(key.value),
    set: (newVal) => cacheProvider.set(key.value, newVal),
  });

  const fetchData = async () => {
    isValidating.value = true;

    try {
      const fetcherResponse = await fetcher.apply(
        fetcher,
        Array.isArray(fetcherArgs.value) ? fetcherArgs.value : [fetcherArgs.value],
      );

      data.value = fetcherResponse;
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

  return {
    data: readonly(data),
    error: readonly(error),
    isValidating: readonly(isValidating),
    mutate: (newValue: Data) => mutateGlobal(key.value, newValue),
  };
};
