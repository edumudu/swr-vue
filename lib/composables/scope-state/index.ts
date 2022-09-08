import { computed, ComputedRef, toRefs, unref, watch } from 'vue';
import { MaybeRef, toReactive } from '@vueuse/core';

import { globalState } from '@/config';
import { CacheProvider, CacheState, ScopeState } from '@/types';

const initScopeState = (cacheProvider: CacheProvider<CacheState>) => {
  globalState.set(cacheProvider, { revalidateCache: new Map() });
};

export const useScopeState = (_cacheProvider: MaybeRef<CacheProvider<CacheState>>) => {
  const cacheProvider = computed(() => unref(_cacheProvider));
  const scopeState = computed(() => globalState.get(cacheProvider.value));

  const onScopeStateChange = () => {
    if (!scopeState.value) initScopeState(cacheProvider.value);
  };

  watch(scopeState, onScopeStateChange, { immediate: true });

  return {
    scopeState: scopeState as ComputedRef<ScopeState>,
    ...toRefs(toReactive(scopeState as ComputedRef<ScopeState>)),
  };
};
