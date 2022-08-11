# API Options

```js
const { data, error, isValidating, mutate } = useSWR(key, fetcher, options)
```

## Parameters

- `key` - A unique key for the request. Can be an `string | array | function | falsy value`
- `fetcher` - A Promise that resolves to the data that you want to use
- `options` - (optional) an object of options for this SWR composable

## Return Values

- `data` - data for the given key resolved by fetcher (or undefined if not loaded)
- `error` - error thrown by fetcher (or undefined if nothing threw)
- `isValidating` - if there's the first request or revalidation going on
- `mutate(updateFn, options?)` - function to mutate the cached data. [More details](./mutation.md)

## Options

- `revalidateOnFocus = true` - Automatically revalidate when window gets focused
- `revalidateOnReconnect = true` - Automatically revalidate when the browser regains a network connection
- `revalidateIfStale = true` - Automatically revalidate if there is stale data
- `dedupingInterval = 2000` - dedupe requests with the same key in this time span in milliseconds
- `fallback` - a key-value object of multiple fallback data
- `fallbackData` - initial data to be returned (this has priority over `fallback` option)
- `onSuccess(data, key, config)` - callback function when a request finishes successfully
- `onError(err, key, config)` - callback function when a request returns an error
