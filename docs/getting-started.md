# Getting Started

## Installation

Inside your vue project directory, run the following:

With pnpm
```bash
pnpm add swr-vue
```

With yarn
```bash
yarn add swr-vue
```

With npm
```bash
npm install swr-vue
```

## Quick Start

First, you need to create a `fetcher` function, for normal RESTful APIs with JSON data, you can just create a wrapper of the native `fetch` function:

```ts
const fetcher = (...args) => fetch(...args).then(res => res.json());
```

then you import you import `useSWR` and can start using inside components



```vue
<script setup>
const { data, error } = useSWR('/api/article/1', fetcher);
</script>

<template>
  <div v-if="error">failed to load the article</div>
  <div v-else-if="!data">loading...</div>
  <div v-else>{{ data.title }}!</div>
</template>
```

Normally, there're 3 possible states of a request: "pending", "ready", or "error". You can use the variables `data` and `error` to determine the current state of the request.

## Reusability

When building an app, you may need to reuse the same data in diferent places. You can create a reusable composable on top of `useSWR` as following:

```js
const useArticle = (id) => {
  const { data, error } = useSWR(`/api/article/${id}`, fetcher);

  return {
    error,
    hasError: !!error.value,
    article: data,
    isLoading: !error.value && !data.value,
  }
}
```

and use it in the components

```vue
<script setup>
// ...
const { article, isLoading, hasError, error } = useArticle(route.params.id);
</script>

<template>
  <Spinner v-if="isLoading" />
  <ErrorState v-if="hasError" :error="error" />
  <Article v-else :article="article" />
</template>
```

By doing this you can fetch data in a more declarative way. Forget about start the request, update loading, and return the final result.
You just need to specify the data used by the component
