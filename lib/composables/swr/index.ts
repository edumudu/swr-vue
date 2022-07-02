import { computed, ref, reactive, readonly, watch } from 'vue';
import { useEventListener } from '@vueuse/core';

import { MapAdapter } from '../../cache';

type SWRKey = string | (() => string);
type SWRFetcher<Data> =
  | ((url: string) => Promise<Data> | Data)
  | (() => Promise<Data> | Data);

type SWRConfig = {
  cacheProvider?: typeof cache;
};

const cache = reactive(new MapAdapter());

export const mutateGlobal = (key: string, value: any) => {
  cache.set(key, value);
};

export const useSWR = <Data = any, Error = any>(
  key: SWRKey,
  fetcher: SWRFetcher<Data>,
  config?: SWRConfig,
) => {
  const { cacheProvider = cache } = config || {};

  const computedKey = computed(typeof key === 'function' ? key : () => key);
  const error = ref<Error>();
  const isValidating = ref(true);
  const data = computed<Data>({
    get: () => cacheProvider.get(computedKey.value),
    set: (newVal) => cacheProvider.set(computedKey.value, newVal),
  });

  const fetchData = async () => {
    isValidating.value = true;

    try {
      const fetcherResponse = await fetcher(computedKey.value);

      data.value = fetcherResponse;
    } catch (err: any) {
      error.value = err;
    } finally {
      isValidating.value = false;
    }
  };

  useEventListener(window, 'focus', () => fetchData());

  watch(
    computedKey,
    (newKey, oldKey) => {
      if (newKey !== oldKey) fetchData();
    },
    { immediate: true },
  );

  return {
    data: readonly(data),
    error: readonly(error),
    isValidating: readonly(isValidating),
    mutate: (newValue: any) => mutateGlobal(computedKey.value, newValue),
  };
};
