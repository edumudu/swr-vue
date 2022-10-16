# Conditional Fetching

## Conditional

Use any [falsy](https://developer.mozilla.org/docs/Glossary/Falsy) value or pass a function as key to conditionally fetch data. If the function throws or returns a [falsy](https://developer.mozilla.org/docs/Glossary/Falsy) value, the `useSWR` will not start the request.

```ts
// conditionally fetch
const { data } = useSWR(shouldFetch ? '/api/todos' : null, fetcher);

// ...or return a falsy value
const { data } = useSWR(() => shouldFetch ? '/api/todos' : null, fetcher);

// ...or throw an error when todo.id is not defined
const { data } = useSWR(() => `/api/todos/${todo.id}`, fetcher);
```

## Dependent

`useSWR` also allows you to fetch data that depends on other data. It allows serial fetching when a piece of dynamic data is required for the next data fetch to happen.

```vue
<script setup>
// When passing a function, `useSWR` will use the return
// value as `key`. If the function throws or returns
// falsy, `useSWR` will know that some dependencies are not
// ready. In this case `user.id` throws when `user`
// isn't loaded.
const { data: user } = useSWR('/api/user')
const { data: projects } = useSWR(() => `/api/projects?userId=${user.id}`)
</script>

<template>
  <div v-if="">loading...</div>
  <div v-else>You have {{ projects.length }} projects</div>
</template>
```
