import { DeepReadonly } from 'vue';

import { expectType } from '@/utils/type-assertions';

import { useSWR } from '.';

type Person = {
  name: string;
  id: string;
  age: number;
};

// Infered types
{
  const { data: data1 } = useSWR('key', () => 'string');
  const { data: data2 } = useSWR('key', () => 1);
  const { data: data3 } = useSWR('key', () => ['string']);
  const { data: data4 } = useSWR('key', () => false);
  const { data: data5 } = useSWR('key', () => ({} as Person));

  expectType<string | undefined>(data1.value);
  expectType<number | undefined>(data2.value);
  expectType<readonly string[] | undefined>(data3.value);
  expectType<boolean | undefined>(data4.value);
  expectType<DeepReadonly<Person> | undefined>(data5.value);
}

// Generics
{
  const { data: data1, error: error1 } = useSWR<number, TypeError>('key', () => 2);

  expectType<number | undefined>(data1.value);
  expectType<TypeError | undefined>(error1.value);

  interface CustomError extends Error {
    name: 'custom-error';
  }

  const { data: data2, error: error2 } = useSWR<string, CustomError>('key', () => 'return');

  expectType<string | undefined>(data2.value);
  expectType<CustomError | undefined>(error2.value);

  interface CustomError extends Error {
    name: 'custom-error';
  }

  /// @ts-expect-error Generic type differ from return type
  useSWR<string>('key', () => 2);
  /// @ts-expect-error Generic type differ from return type
  useSWR<number>('key', () => '');
  /// @ts-expect-error Generic type differ from return type
  useSWR<Person>('key', () => '');
  // Gneric match return error - Expect no error
  useSWR<Person>('key', () => ({} as Person));
}
