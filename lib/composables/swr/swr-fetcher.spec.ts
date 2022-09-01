import { nextTick } from 'vue';
import flushPromises from 'flush-promises';

import { SWRComposableConfig, SWRFetcher } from '@/types';
import { useInjectedSetup, mockedCache } from '@/utils/test';
import { withSetup } from '@/utils/with-setup';

import { useSWR } from '.';
import { configureGlobalSWR } from '../global-swr-config';

const cacheProvider = mockedCache;
const defaultKey = 'defaultKey';
const defaultOptions: SWRComposableConfig = { dedupingInterval: 0 };

describe('useSWR - Fetcher', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    cacheProvider.clear();

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  it.each([
    [() => 'returnedData'],
    [() => 1],
    [() => ({ id: 2 })],
    [() => Promise.resolve('returnedData')],
  ])(
    'should set data returned from fetcher to data variable',
    async (fetcher: SWRFetcher<unknown>) => {
      const { data, isValidating } = useInjectedSetup(
        () => configureGlobalSWR({ cacheProvider }),
        () => useSWR(defaultKey, fetcher, defaultOptions),
      );

      expect(data.value).toEqual(undefined);

      await nextTick();
      expect(data.value).toEqual(await fetcher());
      expect(isValidating.value).toBeFalsy();
    },
  );

  it.each([
    // eslint-disable-next-line prefer-promise-reject-errors
    [() => Promise.reject('Error in fetcher 1'), 'Error in fetcher 1'],
    [() => Promise.reject(new Error('Error in fetcher 2')), new Error('Error in fetcher 2')],
    [
      () => {
        throw new Error('Error in fetcher 3');
      },
      new Error('Error in fetcher 3'),
    ],
  ])('should set error when throw error in fetcher', async (fetcher, expectedError) => {
    const { data, isValidating, error } = useInjectedSetup(
      () => configureGlobalSWR({ cacheProvider }),
      () => useSWR(defaultKey, fetcher, defaultOptions),
    );

    await flushPromises();
    expect(data.value).toEqual(undefined);
    expect(error.value).toEqual(expectedError);
    expect(isValidating.value).toBeFalsy();
  });

  it.each([
    '/user/me',
    'https://google.com',
    ['/api/user', 4, 'authKey'],
    () => '/user/me',
    () => 'https://google.com',
    () => ['/api/user', 4, 'authKey'],
  ])('should call fetcher function passing keys as arguments: %#', async (key) => {
    const fetcher = vi.fn();
    let expectedArgs = typeof key === 'function' ? key() : key;

    expectedArgs = Array.isArray(expectedArgs) ? expectedArgs : [expectedArgs];

    withSetup(() => useSWR(key, fetcher, defaultOptions));

    expect(fetcher).toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledWith(...expectedArgs);
  });
});
