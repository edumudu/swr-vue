import { computed, ref, reactive, readonly, watch, toRef, toRefs } from 'vue';
import { toReactive, useEventListener } from '@vueuse/core';

import { serializeKey } from '@/utils';
import { Key } from '@/types';

import { MapAdapter } from '../../cache';

type SWRKey = Key;
type SWRFetcher<Data> = ((...args: any[]) => Promise<Data> | Data) | (() => Promise<Data> | Data);

type SWRConfig = {
  cacheProvider?: typeof cache;
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
  const { cacheProvider = cache } = config || {};

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

  useEventListener(window, 'focus', () => fetchData());

  watch(
    key,
    (newKey, oldKey) => {
      if (!!newKey && newKey !== oldKey) fetchData();
    },
    { immediate: true },
  );

  return {
    data: readonly(data),
    error: readonly(error),
    isValidating: readonly(isValidating),
    mutate: (newValue: any) => mutateGlobal(key.value, newValue),
  };
};
