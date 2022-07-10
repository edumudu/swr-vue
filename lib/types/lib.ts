export type KeyArguments =
  | string
  | ([any, ...unknown[]] | readonly [any, ...unknown[]])
  | Record<any, any>
  | null
  | undefined
  | false;

export type Key = KeyArguments | (() => KeyArguments);

export interface CacheProvider<Data = any> {
  keys(): IterableIterator<string>;
  has(key: Key): boolean;
  get(key: Key): Data | undefined;
  set(key: Key, value: Data): void;
  delete(key: Key): void;
}

export type SWRConfig = {
  cacheProvider?: CacheProvider;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateIfStale?: boolean;
};
