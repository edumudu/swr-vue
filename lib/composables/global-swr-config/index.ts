import { computed, inject, provide, unref, shallowReadonly } from 'vue';
import { MaybeRef } from '@vueuse/core';

import { defaultConfig, globalConfigKey } from '@/config';
import { SWRConfig } from '@/types';
import { mergeConfig } from '@/utils';

export const useSWRConfig = () => {
  const contextConfig = inject(
    globalConfigKey,
    computed(() => defaultConfig),
  );

  const cacheProvider = computed(() => contextConfig.value.cacheProvider);

  const mutate = <Data = any>(key: string, value: Data) => {
    const cachedValue = cacheProvider.value.get(key);

    if (!cachedValue) return;

    cachedValue.data.value = value;
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
