import { App, provide, ref } from 'vue';
import { Mock } from 'vitest';

import { defaultConfig, globalConfigKey } from '@/config';
import { SWRConfig } from '@/types';
import { withSetup } from '@/utils/with-setup';

import { useSWRConfig, configureGlobalSWR } from '.';

describe('useSWRConfig', () => {
  const provideConfig = (prov: App['provide'], config: SWRConfig) => {
    const mockedConfig = ref(config);

    prov(globalConfigKey, mockedConfig);
  };

  it.each([
    [{}],
    [{ revalidateIfStale: true }],
    [{ revalidateIfStale: false }],
    [{ revalidateIfStale: false, revalidateOnFocus: true }],
    [{ revalidateIfStale: true, revalidateOnFocus: false }],
  ])('should get configs from global configuration: "%s"', (objToProvide) => {
    const [{ config }] = withSetup((app) => {
      provideConfig(app.provide, objToProvide);

      return useSWRConfig();
    });

    expect(config.value).toEqual(objToProvide);
  });

  it('should return default config if not have an provided one', () => {
    const [{ config }] = withSetup(() => useSWRConfig());

    expect(config.value).toEqual(defaultConfig);
  });
});

describe('configureGlobalSWR', () => {
  vi.mock('vue', async () => {
    const original = await vi.importActual('vue'); // Step 2.

    return {
      ...(original as Record<string, unknown>),
      provide: vi.fn(),
    };
  });

  const provideMock = provide as Mock<any[], any>;

  it('should provide the default config if none is provided', () => {
    withSetup(() => configureGlobalSWR({}));

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

    withSetup((app) => {
      app.provide(globalConfigKey, ref(injectedConfig));
      configureGlobalSWR({ revalidateIfStale: true, revalidateOnFocus: false });
    });

    expect(provideMock).toHaveBeenCalled();
    expect(provideMock.mock.calls[0][1].value).toEqual({
      ...injectedConfig,
      revalidateOnFocus: false,
      revalidateIfStale: true,
    });
  });
});
