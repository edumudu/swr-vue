import { DeepReadonly, InjectionKey, Ref } from 'vue';

import { SWRConfig } from '@/types';

/**
 * Key for provide and get current context configs
 * @internal
 */
export const globalConfigKey = Symbol('SWR global config key') as InjectionKey<
  DeepReadonly<Ref<SWRConfig>>
>;
