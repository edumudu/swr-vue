<h1 align="center">
  Vue Swr
</h1>

<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/swr-vue">
    <img alt="" src="https://badgen.net/npm/v/swr-vue">
  </a>
  <a aria-label="License" href="https://github.com/edumudu/swr-vue/blob/main/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/swr-vue">
  </a>
</p>

## Introduction

`swr-vue` is a Vue composables library for data fetching.

The name “**SWR**” is derived from `stale-while-revalidate`, a cache invalidation strategy popularized by [HTTP RFC 5861](https://tools.ietf.org/html/rfc5861).
**SWR** first returns the data from cache (stale), then sends the request (revalidate), and finally comes with the up-to-date data again.

#### Features

- Fast and reusable data fetching
- Transport and protocol agnostic
- Built-in cache and request dedulication
- Revalidation on focus
- Revalidation on network recovery
- Polling
- Local mutation (Optimistic UI)
- Type safe
- Configurable

For a more details you can visit the [documentation](https://edumudu.github.io/swr-vue/)

If you are looking to contribute, please check [CONTRIBUTING.md](./CONTRIBUTING.md)

## Quick Start

```vue
<script setup lang="ts">
import { useSWR } from 'swr-vue';

const fetcher = async (url) => {
  const res = await fetch(url);
  
  return res.json();
}

const { data, error } = useSWR('/api/user', fetcher);
</script>

<template>
  <div v-if="error">failed to load</div>
  <div v-else-if="!data">loading...</div>
  <div v-else>hello {{ data.name }}!</div>
</template>
```

In this example, the composable `useSWR` accepts a `key` and a `fetcher` function.
The `key` is a unique identifier of the request, normally the URL of the API. And the `fetcher` accepts
`key` as its parameter and returns the data asynchronously.

`useSWR` returns 2 values: `data` and `error`. When the request is not yet finished,
`data` and `error` will be `undefined`. And when we get a response, it sets `data` and `error` based on the result
of `fetcher`.

`fetcher` can be any asynchronous function, you can use your favourite data-fetching library to handle that part.

<br/>

## Thanks
`swr-vue` is inspired by these great works:

- [vueuse](https://github.com/antfu/vueuse)
- [vercel/swr](https://github.com/vercel/swr)

## License

The [MIT](LICENSE) License.
