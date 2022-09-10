import type { DeepMaybeRef, MaybeRef } from '@/types/generics';

export type KeyArguments =
  | string
  | ([any, ...unknown[]] | readonly [any, ...unknown[]])
  | Record<any, any>
  | null
  | undefined
  | false;

export type Key = KeyArguments | (() => KeyArguments);
export type SWRKey = MaybeRef<Key>;

export type FetcherResponse<Data = unknown> = Data | Promise<Data>;

export type SWRFetcher<Data> =
  | ((...args: any[]) => FetcherResponse<Data>)
  | (() => FetcherResponse<Data>);

export interface CacheProvider<Data = CacheState> {
  keys(): IterableIterator<string>;
  has(key: Key): boolean;
  get(key: Key): Data | undefined;
  set(key: Key, value: DeepMaybeRef<Data>): void;
  delete(key: Key): void;
  clear(): void;
}

export type CacheState = {
  data: any | undefined;
  error: any | undefined;
  isValidating: boolean;
  fetchedIn: Date;
};

export type ScopeState = {
  revalidateCache: Map<string, Array<() => void | Promise<void>>>; // callbacks to revalidate when key changes
};

export type RevalidatorOpts = {
  dedup?: boolean;
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
   * Disabled by default
   * polling interval in milliseconds
   * @default 0
   */
  refreshInterval: number;

  /**
   * polling when the window is invisible (if `refreshInterval` is enabled)
   * @default false
   */
  refreshWhenHidden: boolean;

  /**
   * polling when the browser is offline (determined by `navigator.onLine`)
   * @default false
   */
  refreshWhenOffline: boolean;

  /**
   * initial data to be returned
   * only revalidate on focus once during a time span in milliseconds
   * @default 5000
   */
  focusThrottleInterval: number;

  /**
   * a key-value object of multiple fallback data
   */
  fallback?: Record<string, any>;

  /**
   * initial data to be returned
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
