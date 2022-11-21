// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable vue/one-component-per-file */
import { createApp, defineComponent, h, reactive, UnwrapRef, createSSRApp, Component } from 'vue';
import { renderToString } from 'vue/server-renderer';

import type { CacheProvider, CacheState, Key } from '@/types';

import { serializeKey } from '../serialize-key';

// Thanks https://github.com/vueuse/vueuse/blob/main/packages/.test/mount.ts

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never;
type VM<V> = InstanceType<V> & { unmount(): void };

const mount = <V extends Component>(componentToMount: V) => {
  const el = document.createElement('div');
  const app = createApp(componentToMount);

  const unmount = () => app.unmount();
  const component = app.mount(el) as any as VM<V>;

  component.unmount = unmount;

  return component;
};

const mountInServer = async <V extends Component>(componentToMount: V) => {
  const app = createSSRApp(componentToMount);

  return {
    app,
    renderString: await renderToString(app),
  };
};

/**
 * Function to replace vue docs `withSetup`.
 * Meant to be used only in tests.
 */
export function useSetup<V>(setup: () => V) {
  const Comp = defineComponent({
    name: 'TestWrapperComponent',
    setup,
    render: () => h('div', []),
  });

  return mount(Comp);
}

/**
 * Function to replace vue docs `withSetup` and allow the setup of providers.
 * Meant to be used only in tests.
 */
export function useInjectedSetup<V>(providerSetup: () => void, setup: () => V) {
  let setupResult: V;

  const Comp = defineComponent({
    name: 'TestWrapperComponent',
    setup() {
      setupResult = setup();

      return setupResult;
    },

    render: () => h('div', []),
  });

  const Provider = defineComponent({
    name: 'TestWrapperComponentProvider',
    components: Comp,
    setup: providerSetup,
    render: () => h('div', [h(Comp)]),
  });

  mount(Provider);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return setupResult;
}

/**
 * Function to test features in ssr.
 * Meant to be used only in tests.
 */
export const useSetupInServer = <V>(setup: () => V) => {
  const Comp = defineComponent({
    name: 'TestWrapperComponent',
    setup,
    render: () => h('div', []),
  });

  return mountInServer(Comp);
};

export const mockedCache = reactive<CacheProvider>(new Map());

export const setDataToMockedCache = (
  key: Key,
  data: UnwrapRef<Partial<CacheState>>,
  cache = mockedCache,
) => {
  const { key: serializedKey } = serializeKey(key);

  cache.set(serializedKey, {
    error: data.error,
    data: data.data,
    isValidating: data.isValidating || false,
    fetchedIn: data.fetchedIn || new Date(),
  });
};

export const getDataFromMockedCache = (key: Key, cache = mockedCache) => {
  const { key: serializedKey } = serializeKey(key);

  return cache.get(serializedKey);
};

export const dispatchEvent = (eventName: string, target: Element | Window | Document) => {
  const event = new Event(eventName, { bubbles: true });

  target.dispatchEvent(event);
};
