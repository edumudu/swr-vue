import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isRef, reactive, ref } from 'vue';
import flushPromises from 'flush-promises';

import { withSetup } from '@/utils/with-setup';

import { useSWR } from '.';

const cacheProvider = reactive(new Map());
const defaultKey = 'defaultKey';
const defaultFetcher = (key: string) => key;
const defaultOptions = { cacheProvider };

describe('useSWR', () => {
  beforeEach(() => {
    cacheProvider.clear();
  });

  it('should return a ref to data, error and isValidating', () => {
    const [result] = withSetup(() => useSWR(defaultKey, defaultFetcher));

    expect(isRef(result.data)).toBeTruthy();
    expect(isRef(result.error)).toBeTruthy();
    expect(isRef(result.isValidating)).toBeTruthy();
  });

  it('should start isValidating as true', () => {
    const [result] = withSetup(() => useSWR(defaultKey, defaultFetcher));

    expect(isRef(result.isValidating)).toBeTruthy();
  });

  it.each([
    [() => 'returnedData'],
    [() => 1],
    [() => ({ id: 2 })],
    [async () => Promise.resolve('returnedData')],
  ])(
    'should set data returned from fetcher to data variable',
    async (fetcher) => {
      const [result] = withSetup(() =>
        useSWR<any>(defaultKey, fetcher, defaultOptions),
      );
      const { data, isValidating } = result;

      expect(data.value).toEqual(undefined);

      await flushPromises();
      expect(data.value).toEqual(await fetcher());
      expect(isValidating.value).toBeFalsy();
    },
  );

  it.each([
    // eslint-disable-next-line prefer-promise-reject-errors
    [() => Promise.reject('Error in fetcher'), 'Error in fetcher'],
    [
      () => Promise.reject(new Error('Error in fetcher')),
      new Error('Error in fetcher'),
    ],
    [
      () => {
        throw new Error('Error in fetcher');
      },
      new Error('Error in fetcher'),
    ],
  ])(
    'should set error when throw error in fetcher',
    async (fetcher, expectedError) => {
      const [result] = withSetup(() =>
        useSWR(defaultKey, fetcher, defaultOptions),
      );
      const { data, isValidating, error } = result;

      await flushPromises();
      expect(data.value).toEqual(undefined);
      expect(error.value).toEqual(expectedError);
      expect(isValidating.value).toBeFalsy();
    },
  );

  it('should return cached value first then revalidate', async () => {
    vi.useFakeTimers();
    cacheProvider.set(defaultKey, 'cachedData');

    const fetcher = async () =>
      new Promise((resolve) => {
        setTimeout(() => resolve('FetcherResult'), 1000);
      });

    const [result] = withSetup(() =>
      useSWR(defaultKey, fetcher, defaultOptions),
    );
    const { data } = result;

    expect(data.value).toBe('cachedData');

    vi.runAllTimers();
    await flushPromises();
    expect(data.value).toBe('FetcherResult');

    vi.useRealTimers();
  });

  it('should revalidate when focus page', async () => {
    cacheProvider.set(defaultKey, 'cachedData');

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const [result] = withSetup(() =>
      useSWR(defaultKey, fetcher, defaultOptions),
    );
    const { data } = result;

    const blurEvent = new Event('blur', { bubbles: true });
    const focusEvent = new Event('focus', { bubbles: true });

    document.dispatchEvent(blurEvent);
    document.dispatchEvent(focusEvent);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(2);
    expect(data.value).toBe('FetcherResult');
  });

  it('should not revalidate when focus if config revalidateOnFocus is false', async () => {
    cacheProvider.set(defaultKey, 'cachedData');

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const [result] = withSetup(() =>
      useSWR(defaultKey, fetcher, { cacheProvider, revalidateOnFocus: false }),
    );
    const { data } = result;

    const blurEvent = new Event('blur', { bubbles: true });
    const focusEvent = new Event('focus', { bubbles: true });

    document.dispatchEvent(blurEvent);
    document.dispatchEvent(focusEvent);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(1);
    expect(data.value).toBe('FetcherResult');
  });

  it('should revalidate when back online', async () => {
    cacheProvider.set(defaultKey, 'cachedData');

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const [result] = withSetup(() =>
      useSWR(defaultKey, fetcher, defaultOptions),
    );
    const { data } = result;

    const onlineEvent = new Event('online', { bubbles: true });

    document.dispatchEvent(onlineEvent);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(2);
    expect(data.value).toBe('FetcherResult');
  });

  it('should not revalidate when back online if config revalidateOnReconnect is false', async () => {
    cacheProvider.set(defaultKey, 'cachedData');

    const fetcher = vi.fn().mockResolvedValue('FetcherResult');
    const [result] = withSetup(() =>
      useSWR(defaultKey, fetcher, {
        cacheProvider,
        revalidateOnReconnect: false,
      }),
    );
    const { data } = result;

    const onlineEvent = new Event('online', { bubbles: true });

    document.dispatchEvent(onlineEvent);

    await flushPromises();
    expect(fetcher).toBeCalledTimes(1);
    expect(data.value).toBe('FetcherResult');
  });

  it('should be reactive to the key as function with ref', async () => {
    const key = ref('initialKey');
    const fetcher = vi.fn();

    withSetup(() =>
      useSWR(() => `testing-key/${key.value}`, fetcher, defaultOptions),
    );

    expect(fetcher).toBeCalledTimes(1);

    key.value = 'newKey';

    await flushPromises();
    expect(fetcher).toBeCalledTimes(2);
  });
});
