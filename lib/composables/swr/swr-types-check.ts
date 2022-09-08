import { Ref } from 'vue';

import { useSWR } from '.';

type ExpectType = <T>(value: T) => void;

const expectType: ExpectType = () => {};

const { data: inferedData } = useSWR('key', () => 'string');
const { data: genericData, error: genericError } = useSWR<number, TypeError>('key', () => 2);

// Infered types
expectType<Readonly<Ref<string | undefined>>>(inferedData);

// Types from generics
expectType<Readonly<Ref<number | undefined>>>(genericData);
expectType<Readonly<Ref<TypeError | undefined>>>(genericError);
