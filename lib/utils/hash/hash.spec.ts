import { hash } from '.';

describe('hash', () => {
  it.each([
    ['foo', 'foo'],
    ['bar', 'bar'],
    ['baz""%', 'baz""%'],
    [1, '1'],
    [329382, '329382'],
    [Symbol('test'), 'Symbol(test)'],
    [Symbol('3232'), 'Symbol(3232)'],
    [new Date('2022-07-06T01:51:06.172Z'), '2022-07-06T01:51:06.172Z'],
    [new Date('1970-01-01T00:00:00.000Z'), '1970-01-01T00:00:00.000Z'],
    [{ foo: 'bar' }, '#foo:bar'],
    [{ foo: 'bar', bar: 'baz', fas: 'foo' }, '#bar:baz,fas:foo,foo:bar'],
    [
      [new Date('1970-01-01T00:00:00.000Z'), 'foo', 1, { foo: 'bar' }],
      '1970-01-01T00:00:00.000Z,foo,1,#foo:bar',
    ],
  ])('should hash the "%s"', (source, expected) => {
    expect(hash(source)).to.equal(expected);
  });
});
