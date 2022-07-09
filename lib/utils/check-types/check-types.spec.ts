import { isFunction, isDate } from '.';

describe('isFunction', () => {
  it.each([
    [() => ({}), true],
    [() => [], true],
    [() => true, true],
    [() => 'foo', true],
    [true, false],
    [[], false],
    [{}, false],
    ['', false],
    [1, false],
    [new Date(), false],
  ])('should return true if value is a function', (source, expected) => {
    expect(isFunction(source)).toBe(expected);
  });
});

describe('isDate', () => {
  it.each([
    [new Date(), true],
    [new Date('1970-01-01T00:00:00.000Z'), true],
    [() => ({}), false],
    [true, false],
    [[], false],
    [{}, false],
    ['', false],
    [1, false],
  ])('should return true if value is a function', (source, expected) => {
    expect(isDate(source)).toBe(expected);
  });
});
