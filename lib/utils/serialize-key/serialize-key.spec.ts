import { hash } from '@/utils';

import { serializeKey } from '.';

describe('serializeKey', () => {
  it('should return the generated key', () => {
    const sourceKey = 'key-home';
    const { key } = serializeKey(sourceKey);

    expect(key).toBe(hash(sourceKey));
  });

  it('should return empty key when fail the function key', () => {
    const sourceKey = () => {
      throw new Error('Failed');
    };
    const { key } = serializeKey(sourceKey);

    expect(key).toBe('');
  });

  it('should return the result of the function key', () => {
    const sourceKey = () => 'return';
    const { key } = serializeKey(sourceKey);

    expect(key).toBe('return');
  });
});
