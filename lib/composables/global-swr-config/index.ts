import { computed, inject, provide, readonly } from 'vue';

import { defaultConfig, globalConfigKey } from '@/config';
import { SWRConfig } from '@/types';
import { mergeConfig } from '@/utils';

export const useGlobalSWRConfig = () => {
  const globalConfig = inject(
    globalConfigKey,
    computed(() => defaultConfig),
  );

  return { globalConfig };
};

export const configureGlobalSWR = (config: Partial<SWRConfig>) => {
  const { globalConfig } = useGlobalSWRConfig();
  const mergedConfig = computed(
    () => mergeConfig(globalConfig.value, config) as Required<SWRConfig>,
  );

  provide(globalConfigKey, readonly(mergedConfig));
};
