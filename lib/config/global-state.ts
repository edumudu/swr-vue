import { reactive } from 'vue';

import { CacheProvider, CacheState, ScopeState } from '@/types';

/**
 * Holds the scope's states, isolated using cacheProvider as key
 */
export const globalState = reactive(new WeakMap<CacheProvider<CacheState>, ScopeState>());
