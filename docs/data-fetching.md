# Data Fetching

The basic use is of `useSWR` composable is:

```ts
const { data, error } = useSWR(key, fetcher);
```

Here, the `fetcher` is a function and receives the key as the first argument, then return the data to be cached.

The returned value will be avaiable in `data` and if fetcher throws, the error will be caught in `error`.

## Fetcher

You can use any library to fetch the data.

### Native `fetch`

```ts
import { useSWR } from 'swr-vue'

const fetcher = url => fetch(url).then(response => response.json())

const { data, error } = useSWR('/api/todos', fetcher)
```

### Axios

```ts
import { useSWR } from 'swr-vue'
import axios from 'axios'

const fetcher = url => axios.get(url).then(res => res.data);

const { data, error } = useSWR('/api/data', fetcher);
```
