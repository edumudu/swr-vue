import { Ref } from 'vue';

export type KeyArguments =
  | string
  | ([any, ...unknown[]] | readonly [any, ...unknown[]])
  | Record<any, any>
  | null
  | undefined
  | false;

export type Key = KeyArguments | (() => KeyArguments);
export type SWRKey = Key;
export type SWRFetcher<Data> =
  | ((...args: any[]) => Promise<Data> | Data)
  | (() => Promise<Data> | Data);

export interface CacheProvider<Data = any> {
  keys(): IterableIterator<string>;
  has(key: Key): boolean;
  get(key: Key): Data | undefined;
  set(key: Key, value: Data): void;
  delete(key: Key): void;
  clear(): void;
}

export type CacheState = {
  data: Ref<any>;
  error: Ref<any>;
  isValidating: Ref<boolean>;
  fetchedIn: Ref<Date>;
};

export type SWRConfig = {
  cacheProvider?: CacheProvider<CacheState>;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateIfStale?: boolean;
  dedupingInterval?: number;
};

export type SWRComposableConfig = Omit<SWRConfig, 'cacheProvider'>;
