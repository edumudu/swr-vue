// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable vue/one-component-per-file */
import { createApp, defineComponent, h } from 'vue';

// Thanks https://github.com/vueuse/vueuse/blob/main/packages/.test/mount.ts

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never;
type VM<V> = InstanceType<V> & { unmount(): void };

const mount = <V>(componentToMount: V) => {
  const el = document.createElement('div');
  const app = createApp(componentToMount);

  const unmount = () => app.unmount();
  const component = app.mount(el) as any as VM<V>;

  component.unmount = unmount;

  return component;
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
