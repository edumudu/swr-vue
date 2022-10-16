# Typescript

`swr-vue` is written in typescript and is type safe out of the box.

## Generics

To specify the type of `data` by default, it will use the return type of `fetcher` (with `undefined` for the non-ready state) as the data type, but you can also pass it as a parameter:

```ts
// Specify the data type:
// `fetchUser` is `(endpoint: string) => User`.
const { data } = useSWR<User>('/api/user', fetchUser)

// Specify the error type:
// `fetchUser` is `(endpoint: string) => User`.
const { data } = useSWR<User, UserFetchError>('/api/user', fetchUser)
```
