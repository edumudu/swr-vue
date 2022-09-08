import { computed, inject, provide, unref, shallowReadonly, toRefs } from 'vue';
import { MaybeRef } from '@vueuse/core';

import { defaultConfig, globalConfigKey } from '@/config';
import { AnyFunction, Key, SWRConfig } from '@/types';
import { isUndefined, mergeConfig, serializeKey } from '@/utils';
import { useScopeState } from '@/composables/scope-state';

export type MutateOptions = {
  optimisticData?: unknown;
  rollbackOnError?: boolean;
};

export const useSWRConfig = () => {
  const contextConfig = inject(
    globalConfigKey,
    computed(() => defaultConfig),
  );

  const mutate = async <U extends unknown | Promise<unknown> | AnyFunction>(
    _key: Key,
    updateFnOrPromise?: U,
    options: MutateOptions = {},
  ) => {
    const { key } = serializeKey(_key);
    const cachedValue = contextConfig.value.cacheProvider.get(key);
    const { optimisticData, rollbackOnError } = options;

    if (!cachedValue) return;

    const { data } = toRefs(cachedValue);
    const currentData = data.value;

    const resultPromise: unknown | Promise<unknown> =
      typeof updateFnOrPromise === 'function'
        ? updateFnOrPromise(cachedValue.data)
        : updateFnOrPromise;

    if (optimisticData) {
      data.value = optimisticData;
    }

    try {
      data.value = await resultPromise;
    } catch (error) {
      if (rollbackOnError) {
        data.value = currentData;
      }

      throw error;
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
