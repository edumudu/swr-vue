import { SWRConfig } from '@/types';

export const mergeConfig = <T extends Partial<SWRConfig>, D extends Partial<SWRConfig>>(
  fallbackConfig: T,
  config: D,
) => ({
  ...fallbackConfig,
  ...config,
});
