# Global Configuration

You can use `configureGlobalSWR` function to create a configuration scope (this uses [provide/inject](https://vuejs.org/guide/components/provide-inject.html) under the hood) and provide a sharable configuration to all composables under this scope.

```ts
import { configureGlobalSWR } from 'swr-vue';

configureGlobalSWR(options)
```

> [Available options](./options.md)

## Extra options

### Cache Provider

`configureGlobalSWR` also accepts an optional cache provider.

```ts
configureGlobalSWR({ cacheProvider: new Map() });
```

## Access Current Scope Configurations

You can use the `useSWRConfig` composable to get the scope configurations, as well as mutate and cache.

```ts
import { useSWRConfig } from 'swr-vue';

const { config, mutate } = useSWRConfig();
```

Nested configurations will be extended. If no `configureGlobalSWR` is used, it will return the default ones.
