# Error Handling

If an error is thrown inside [fetcher](./data-fetching), it will be returned as `error` by the composable

```ts
// ...
const { data, error } = useSWR('/api/user', fetcher);
```

The `error` object will be defined if the fetch promise is rejected or `fetcher` contains an syntax error.

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
