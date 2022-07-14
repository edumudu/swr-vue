import { SWRConfig } from '@/types';
import { MapAdapter } from '@/cache';

export const defaultConfig: Required<SWRConfig> = {
  cacheProvider: new MapAdapter(),
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  dedupingInterval: 2000,
};
