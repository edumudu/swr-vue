# Mutation

You can get the `mutate` function from `useSWRConfig` composable, and emit an global revalidation to all composables using the same key calling `mutate(key, () => newData)`

> Note: any change made by the function `mutate` will be limited to the current scope's cache provider, if the function is not inside a scope, the default cache provider will be used.

### Options Available

- `optimisticData` - The data to be immediately written in the cache, commonly used for optimistic UI
- `rollbackOnError` - If the cache should revert if the mutation fails

## Optimistic Updates

In many cases you may guess that the remote update will success, and you want to apply the optimistic UI.

With `mutate`, you can update you client data programatically, while revalidating, and finally replace it with the latest data if the remote update success.

```vue
<script setup>
import useSWR, { useSWRConfig } from 'swr-vue'

const { mutate } = useSWRConfig()
const { data } = useSWR('/api/todo/1', fetcher);

const completeTodo = () => {
  const newTodo = {
    ...data.value,
    completed: true,
  }

  // updates the local data immediately
  // send a request to update the data and write in the cache
  mutate('/api/todo/1', updateFn(newTodo), {
    optimisticData: newTodo,
    rollbackOnError: true
  });
}
</script>

<template>
  <button
    v-if="data.completed"
    @click="completeTodo"
  >
    Complete todo
  </button>
</template>
```

## Mutation based on current data

You can pass an function, async function or promise to the second argument, and the value resolved from this, will be writed in the cache. In case that the value passed is a function, it will receive the current data in the cache as the first parameter.

```ts
mutate('/api/todos', async todos => {
  // Mark the todo with the id `1` as completed
  const updatedTodo = await fetch('/api/todos/1', {
    method: 'PATCH',
    body: JSON.stringify({ completed: true })
  })

  // Remove the todo with the id 1; 
  const filteredTodos = todos.filter(todo => todo.id !== '1');
  // Returns the todos updated
  return [...filteredTodos, updatedTodo]
})
```

## Returned Data from Mutate

In case that you need to use the updated data resolved from your update function or promise, the `mutate` will return the resolved value.

The `mutate` function also will throw an error if the passed promise rejects or the passed function throws an error, this way you can deal with the error properly

```ts
try {
  const todo = await mutate('/api/todos', updateTodo(newTodo))
} catch (error) {
  // Handle an error while updating the todo here
}
```

## Bound mutate

The object returned from `useSWR` composable also has a `mutate` function that is bounded to the SWR's key

```vue
<script setup>
import useSWR, { useSWRConfig } from 'swr-vue'

const { data, mutate } = useSWR('/api/todo/1', fetcher);

const completeTodo = () => {
  const newTodo = {
    ...data.value,
    completed: true,
  }

  // Note that the key is not need here
  mutate(updateFn(newTodo), {
    optimisticData: newTodo,
    rollbackOnError: true
  });
}
</script>

<template>
  <button
    v-if="data.completed"
    @click="completeTodo"
  >
    Complete todo
  </button>
</template>
```
