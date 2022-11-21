import { computed, inject, provide, unref, shallowReadonly, toRefs, ref } from 'vue';
import { MaybeRef } from '@vueuse/core';

import { defaultConfig, globalConfigKey } from '@/config';
import { AnyFunction, CacheState, Key, SWRConfig } from '@/types';
import { isUndefined, mergeConfig, serializeKey, isFunction } from '@/utils';
import { useScopeState } from '@/composables/scope-state';

export type MutateOptions = {
  optimisticData?: unknown;
  rollbackOnError?: boolean;
  revalidate?: boolean;
};

const createCacheState = (data: unknown): CacheState => ({
  data,
  error: undefined,
  isValidating: false,
  fetchedIn: new Date(),
});

export const useSWRConfig = () => {
  const contextConfig = inject(
    globalConfigKey,
    computed(() => defaultConfig),
  );

  const cacheProvider = computed(() => contextConfig.value.cacheProvider);

  const { revalidateCache } = useScopeState(cacheProvider);

  const mutate = async <U extends unknown | Promise<unknown> | AnyFunction>(
    _key: Key,
    updateFnOrPromise?: U,
    options: MutateOptions = {},
  ) => {
    const { key } = serializeKey(_key);
    const cache = cacheProvider.value;
    const cacheState = cache.get(key);
    const hasCache = !isUndefined(cacheState);
    const { optimisticData, rollbackOnError, revalidate = true } = options;

    const { data } = hasCache ? toRefs(cacheState) : { data: ref() };
    const dataInCache = data.value;

    const resultPromise: unknown | Promise<unknown> = isFunction(updateFnOrPromise)
      ? updateFnOrPromise(dataInCache)
      : updateFnOrPromise;

    if (optimisticData) {
      data.value = optimisticData;
    }

    try {
      data.value = isUndefined(resultPromise) ? data.value : await resultPromise;
    } catch (error) {
      if (rollbackOnError) {
        data.value = dataInCache;
      }

      throw error;
    }

    cache.set(key, hasCache ? cacheState : createCacheState(data));

    const revalidationCallbackcs = revalidateCache.value.get(key) || [];

    if (revalidate && revalidationCallbackcs.length) {
      const [firstRevalidateCallback] = revalidationCallbackcs;

      await firstRevalidateCallback();
    }

    return data.value;
  };

  return {
    config: contextConfig,
    mutate,
  };
};

export const configureGlobalSWR = (config: MaybeRef<Partial<SWRConfig>>) => {
  const { config: contextConfig } = useSWRConfig();
  const mergedConfig = computed(() => mergeConfig(contextConfig.value, unref(config)));

  provide(globalConfigKey, shallowReadonly(mergedConfig));
};

/**
 * @deprecated use `useSWRConfig` instead
 */
export const useGlobalSWRConfig = () => {
  const { config, ...rest } = useSWRConfig();

  return {
    ...rest,
    globalConfig: config,
  };
};
