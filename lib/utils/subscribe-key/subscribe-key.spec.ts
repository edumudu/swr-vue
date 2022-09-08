import { Key } from '@/types';

import { subscribeCallback, unsubscribeCallback, SubscribeCallbackCache } from '.';

describe('subscribe-key', () => {
  const defaultKey: Key = 'key';
  const defaultCbCache: SubscribeCallbackCache = new Map();

  beforeEach(() => {
    defaultCbCache.clear();
  });

  describe('subscribeCallback', () => {
    it('should subscribe callback to passed key', () => {
      const cb = vi.fn();

      subscribeCallback(defaultKey, cb, defaultCbCache);

      expect(defaultCbCache.get(defaultKey)).toHaveLength(1);
      expect(defaultCbCache.get(defaultKey)).toContain(cb);
    });

    it('should subscribe callback isolated by keys', () => {
      const keyA = 'key1';
      const keyB = 'test';

      subscribeCallback(keyA, vi.fn(), defaultCbCache);
      subscribeCallback(keyA, vi.fn(), defaultCbCache);
      subscribeCallback(keyA, vi.fn(), defaultCbCache);
      subscribeCallback(keyB, vi.fn(), defaultCbCache);

      expect(defaultCbCache.get(keyA)).toHaveLength(3);
      expect(defaultCbCache.get(keyB)).toHaveLength(1);
    });

    it('should return an unsubscribe function', () => {
      const keyA = 'key1';
      const keyB = 'test';

      const cbA = vi.fn();
      const cbB = vi.fn();

      const unsubA = subscribeCallback(keyA, cbA, defaultCbCache);
      const unsubB = subscribeCallback(keyB, cbB, defaultCbCache);

      subscribeCallback(keyA, vi.fn(), defaultCbCache);
      subscribeCallback(keyA, vi.fn(), defaultCbCache);
      subscribeCallback(keyB, vi.fn(), defaultCbCache);

      unsubA();
      expect(defaultCbCache.get(keyA)).toHaveLength(2);
      expect(defaultCbCache.get(keyA)).not.toContain(cbA);

      unsubB();
      expect(defaultCbCache.get(keyB)).toHaveLength(1);
      expect(defaultCbCache.get(keyB)).not.toContain(cbB);
    });
  });

  describe('unsubscribeCallback', () => {
    it('should unsubscribe callback to passed key', () => {
      const cb = vi.fn();

      subscribeCallback(defaultKey, cb, defaultCbCache);
      unsubscribeCallback(defaultKey, cb, defaultCbCache);

      expect(defaultCbCache.get(defaultKey)).not.toContain(cb);
    });

    it('should unsubscribe isolated callbacks by key', () => {
      const keyA = 'key1';
      const keyB = 'test';
      const cb = vi.fn();

      defaultCbCache.set(keyA, [vi.fn()]);
      defaultCbCache.set(keyB, [vi.fn(), cb, vi.fn()]);

      unsubscribeCallback(keyB, cb, defaultCbCache);

      expect(defaultCbCache.get(keyA)).toHaveLength(1);
      expect(defaultCbCache.get(keyB)).toHaveLength(2);
    });

    it('should not throw when called upon empty key', () => {
      defaultCbCache.delete(defaultKey);

      expect(() => unsubscribeCallback(defaultKey, vi.fn(), defaultCbCache)).not.toThrow();
    });
  });
});
