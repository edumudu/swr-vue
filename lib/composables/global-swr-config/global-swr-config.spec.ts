import { provide, ref } from 'vue';
import { Mock } from 'vitest';

import { defaultConfig, globalConfigKey } from '@/config';
import { AnyFunction, SWRConfig } from '@/types';
import { useInjectedSetup, useSetup } from '@/utils/test';

import { useSWRConfig, configureGlobalSWR } from '.';

describe('useSWRConfig', () => {
  it.each([
    [{}],
    [{ revalidateIfStale: true }],
    [{ revalidateIfStale: false }],
    [{ revalidateIfStale: false, revalidateOnFocus: true }],
    [{ revalidateIfStale: true, revalidateOnFocus: false }],
  ])('should get configs from global configuration: "%s"', (objToProvide) => {
    const { config } = useInjectedSetup(
      () => provide(globalConfigKey, ref(objToProvide)),
      () => useSWRConfig(),
    );

    expect(config.value).toEqual(objToProvide);
  });

  it('should return default config if not have an provided one', () => {
    const instance = useSetup(useSWRConfig);

    expect(instance.config).toEqual(defaultConfig);
  });
});

describe('configureGlobalSWR', () => {
  vi.mock('vue', async () => {
    const original = (await vi.importActual('vue')) as Record<string, unknown>; // Step 2.

    return {
      ...original,
      provide: vi.fn(original.provide as AnyFunction),
    };
  });

  const provideMock = provide as Mock<any[], any>;

  it('should provide the default config if none is provided', () => {
    useSetup(() => configureGlobalSWR({}));

    expect(provideMock).toHaveBeenCalled();
    expect(provideMock.mock.calls[0][0]).toEqual(globalConfigKey);
    expect(provideMock.mock.calls[0][1].value).toEqual(defaultConfig);
  });

  it('should merge context config and the passed by argument', () => {
    const injectedConfig: Partial<SWRConfig> = Object.freeze({
      ...globalConfigKey,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });

    useInjectedSetup(
      () => provide(globalConfigKey, ref(injectedConfig)),
      () => configureGlobalSWR({ revalidateIfStale: true, revalidateOnFocus: false }),
    );

    expect(provideMock).toHaveBeenCalled();
    expect(provideMock.mock.calls[1][1].value).toEqual({
      ...injectedConfig,
      revalidateOnFocus: false,
      revalidateIfStale: true,
    });
  });
});
