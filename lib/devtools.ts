/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-param-reassign */
import { App, PluginDescriptor, setupDevtoolsPlugin, DevtoolsPluginApi } from '@vue/devtools-api';
import { watch } from 'vue';

import { defaultConfig } from '@/config';

type AnyFunction = (...args: any[]) => any;

type HookType<
  TApi extends DevtoolsPluginApi<unknown>,
  THookName extends keyof TApi['on'],
  T = TApi['on'][THookName],
> = T extends AnyFunction ? Parameters<T>[0] : never;

const inspectorId = 'swr-vue-inspector';

export function setupDevtools(app: App) {
  const setupPluginSettings: PluginDescriptor = {
    id: 'swr-vue-devtools-plugin',
    label: 'Stale-While-Revalidate Vue',
    packageName: 'swr-vue',
    homepage: 'https://edumudu.github.io/swr-vue/',
    app,
  };

  const isSwrInspector = (id: string) => id === inspectorId;

  setupDevtoolsPlugin(setupPluginSettings, (api) => {
    const handleGetInspectorTree: HookType<typeof api, 'getInspectorTree'> = (payload) => {
      if (!isSwrInspector(inspectorId)) return;

      payload.rootNodes = [
        {
          id: 'root',
          label: 'Global scope',
        },
      ];
    };

    const handleGetInspectorState: HookType<typeof api, 'getInspectorState'> = (payload) => {
      if (!isSwrInspector(inspectorId) || payload.nodeId !== 'root') return;

      const entries = Array.from(defaultConfig.cacheProvider.entries(), ([key, value]) => ({
        key,
        value,
      }));

      payload.state = {
        'Global cache': entries,
      };
    };

    api.addInspector({
      id: inspectorId,
      label: 'SWR',
      icon: 'archive',
    });

    api.on.getInspectorTree(handleGetInspectorTree);
    api.on.getInspectorState(handleGetInspectorState);

    watch(defaultConfig.cacheProvider, () => api.sendInspectorState(inspectorId), { deep: true });
  });
}
