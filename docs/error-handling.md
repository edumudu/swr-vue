# Error Handling

If an error is thrown inside [fetcher](./data-fetching), it will be returned as `error` by the composable

```ts
// ...
const { data, error } = useSWR('/api/user', fetcher);
```

The `error` object will be defined if the fetch promise is rejected or `fetcher` contains an syntax error.

> Note that `data` and `error` can exist at the same time. So the UI can display the existing data, while knowing the upcoming request has failed.

## Status Code and Error Object

Sometimes we want the API to return an error along with the status code. Both are useful for the client.

We may arrange for our `fetcher` to return additional information. If the status code is not 2xx, we treat it as an error even though it can be parsed as JSON:

```ts
const fetcher = async url => {
  const res = await fetch(url)

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')

    // Attach extra info to the error object.
    error.info = await res.json()
    error.status = res.status

    throw error
  }

  return res.json()
}

// ...
const { error } = useSWR('/api/user', fetcher)
// error.value.info === {
//   message: "You are not authorized to access this resource.",
//   documentation_url: "..."
// }
// error.value.status === 403
```

## Global Error Report

You can always get the `error` object inside the component reactively. But in case you want to handle the error globally, to notify the UI to show a toast or a snackbar, or report it somewhere such as [Sentry](https://sentry.io/), there's an `onError` event:

```ts
configureGlobalSWR({
  onError: (error, key) => {
    // We can send the error to Sentry,

    if (error.status !== 403 && error.status !== 404) {
      // or show a notification UI.
    }
  }
})
```

This is also available in the composable options.

In case that you pass an global `onError` and in a composable inside the same context also pass a `onError` the two of them will be called. First the local one followed by the global
