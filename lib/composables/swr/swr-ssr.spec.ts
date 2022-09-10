/**
 * @vitest-environment node
 */

import { SWRComposableConfig } from '@/types';
import { useSetupInServer } from '@/utils/test';

import { useSWR } from '.';

const defaultKey = 'defaultKey';
const defaultFetcher = vi.fn((key: string) => key);

describe('useSWR - Cache', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('should not throw when rendered in server with default options', async () => {
    await useSetupInServer(() => {
      expect(() => useSWR(defaultKey, defaultFetcher)).not.toThrow();
    });

    expect.assertions(1);
  });

  it('should not throw when rendered in server with options using browser APIs', async () => {
    const config: SWRComposableConfig = {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    };

    await useSetupInServer(() => {
      expect(() => useSWR(defaultKey, defaultFetcher, config)).not.toThrow();
    });

    expect.assertions(1);
  });
});
