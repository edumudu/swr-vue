import { SWRConfig } from '@/types';

import { chainFns } from '../chain-fn';

export const mergeConfig = <T extends Partial<SWRConfig>, D extends Partial<SWRConfig>>(
  fallbackConfig: T,
  config: D,
) => {
  const onSuccess = [config.onSuccess, fallbackConfig.onSuccess].filter(Boolean);
  const onError = [config.onError, fallbackConfig.onError].filter(Boolean);

  return {
    ...fallbackConfig,
    ...config,

    onSuccess: onSuccess.length > 0 ? chainFns(...onSuccess) : undefined,
    onError: onError.length > 0 ? chainFns(...onError) : undefined,
  };
};
