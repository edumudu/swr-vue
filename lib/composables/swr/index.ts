import { computed, ref, reactive, readonly, watch, toRefs } from 'vue';
import { toReactive, useEventListener } from '@vueuse/core';

import { serializeKey } from '@/utils';
import { Key } from '@/types';

import { MapAdapter } from '../../cache';

type SWRKey = Key;
type SWRFetcher<Data> = ((...args: any[]) => Promise<Data> | Data) | (() => Promise<Data> | Data);

type SWRConfig = {
  cacheProvider?: typeof cache;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateIfStale?: boolean;
};

const cache = reactive(new MapAdapter());

export const mutateGlobal = (key: string, value: any) => {
  cache.set(key, value);
};

export const useSWR = <Data = any, Error = any>(
  _key: SWRKey,
  fetcher: SWRFetcher<Data>,
  config?: SWRConfig,
) => {
  const {
    cacheProvider = cache,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    revalidateIfStale = true,
  } = config || {};

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
