import { App, createApp } from 'vue';

/**
 * Use this function for test coposables that depend on lifecycles or provide/inject
 */
export function withSetup<C extends () => any>(composable: C): [ReturnType<C>, App<Element>] {
  let result: ReturnType<C> = null as any;

  const app = createApp({
    name: 'TestApp',
    setup() {
      result = composable();

      // suppress missing template warning
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    },
  });

  app.mount(document.createElement('div'));
  // return the result and the app instance
  // for testing provide / unmount
  return [result, app];
}
