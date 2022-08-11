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

export type SWRConfig<Data = any, Err = any> = {
  /**
   * stores the cached values
   * @default new Map()
   */
  cacheProvider: CacheProvider<CacheState>;

  /**
   * automatically revalidate when window gets focused
   * @default true
   */
  revalidateOnFocus: boolean;

  /**
   * automatically revalidate when the browser regains a network connection (via `navigator.onLine`)
   * @default true
   */
  revalidateOnReconnect: boolean;

  /**
   * automatically revalidate even if there is stale data
   * @default true
   */
  revalidateIfStale: boolean;

  /**
   * dedupe requests with the same key in this time span in miliseconds
   * @default 2000
   */
  dedupingInterval: number;

  /**
   * only revalidate on focus once during a time span in milliseconds
   * @default 5000
   */
  focusThrottleInterval: number;

  /**
   * initial data to be returned (note: ***This is per-composable***)
   */
  fallbackData?: Data;

  /**
   * called when a request finishes successfully
   */
  onSuccess?: (data: Data, key: string, config: SWRConfig<Data, Err>) => void;

  /**
   * called when a request returns an error
   */
  onError?: (err: Err, key: string, config: SWRConfig<Data, Err>) => void;
};

export type SWRComposableConfig = Omit<Partial<SWRConfig>, 'cacheProvider'>;
