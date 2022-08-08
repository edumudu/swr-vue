import { reactive } from 'vue';

import { SWRConfig } from '@/types';
import { MapAdapter } from '@/cache';

export const defaultConfig: SWRConfig = {
  cacheProvider: reactive(new MapAdapter()),
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  dedupingInterval: 2000,
};
