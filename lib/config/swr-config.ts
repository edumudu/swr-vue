import { reactive } from 'vue';

import { SWRConfig } from '@/types';
import { MapAdapter } from '@/cache';

export const defaultConfig: SWRConfig = {
  cacheProvider: reactive(new MapAdapter()),
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  focusThrottleInterval: 5000,
  dedupingInterval: 2000,
};
