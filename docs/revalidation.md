# Automatic Revalidation

If you want to manually revalidate the data, you can disable revaldation with [options](./options.md) and use [mutation](./mutation.md).

## Revalidate on Focus

When you re-focus a page or switch between tabs, `useSWR` automatically revalidates data.

This can be useful to synchronize immediately with the latest state. This is useful for refreshing data in situations like stale mobile tabs or a laptop that has gone to sleep.

> This feature is enabled by default but can be disabled via the [revalidateOnFocus](./options.md) option.

## Revalidate on Interval

In many cases, data changes due to multiple devices, multiple users, multiple tabs. How can we update the data on the screen over time?

`useSWR` will give you the option to automatically refetch data. It’s will only happen if the component associated with the hook is mounted.

> This feature is disabled by default but can be enabled via the [refreshInterval](./options.md) option.

> There are also options such as `refreshWhenHidden` and `refreshWhenOffline`. Both are disabled by default so `useSWR` will not fetch when the webpage is not on screen, or there is no network connection

## Revalidate on Reconnect

It is also useful revalidate when the user is back online. This scenario happens a lot when the user unlocks their computer, but the internet is not yet connected at the same time.

> This feature is enabled by default but can be disabled via the [revalidateOnReconnect](./options.md) option.
