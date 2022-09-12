export type SubscribeCallback = () => void;
export type SubscribeCallbackCache = Map<string, SubscribeCallback[]>;

export const unsubscribeCallback = (
  key: string,
  cb: SubscribeCallback,
  cbCache: SubscribeCallbackCache,
) => {
  const callbacks = cbCache.get(key) || [];
  const newCallbacks = callbacks.filter((currentCb) => currentCb !== cb);

  cbCache.set(key, newCallbacks);
};

export const subscribeCallback = (
  key: string,
  cb: SubscribeCallback,
  cbCache: SubscribeCallbackCache,
) => {
  const callbacks = cbCache.get(key) || [];

  cbCache.set(key, [...callbacks, cb]);

  return () => unsubscribeCallback(key, cb, cbCache);
};
