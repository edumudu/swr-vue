import { SWRConfig } from '@/types';

export const mergeConfig = (
  fallbackConfig: Partial<SWRConfig>,
  config: Partial<SWRConfig> = {},
) => ({
  ...fallbackConfig,
  ...config,
});
