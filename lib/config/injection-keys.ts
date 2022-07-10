import { DeepReadonly, InjectionKey, Ref } from 'vue';

import { SWRConfig } from '@/types';

/**
 * @internal
 */
export const globalConfigKey = Symbol('SWR global config key') as InjectionKey<
  DeepReadonly<Ref<Required<SWRConfig>>>
>;
