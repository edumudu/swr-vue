import { isFunction, isDate, isUndefined } from '.';

beforeEach(() => {
  vi.useRealTimers();
});

describe('isFunction', () => {
  it('should return true if value is a function', () => {
    expect(isFunction(() => ({}))).toBe(true);
    expect(isFunction(() => [])).toBe(true);
    expect(isFunction(() => true)).toBe(true);
    expect(isFunction(() => 'foo')).toBe(true);
    expect(isFunction(true)).toBe(false);
    expect(isFunction([])).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction('')).toBe(false);
    expect(isFunction(1)).toBe(false);
    expect(isFunction(new Date())).toBe(false);
  });
});

describe('isDate', () => {
  it('should return true if value is a date', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('1970-01-01T00:00:00.000Z'))).toBe(true);
    expect(isDate('1970-01-01T00:00:00.000Z')).toBe(false);
    expect(isDate(() => ({}))).toBe(false);
    expect(isDate(true)).toBe(false);
    expect(isDate([])).toBe(false);
    expect(isDate({})).toBe(false);
    expect(isDate('')).toBe(false);
    expect(isDate(1)).toBe(false);
  });
});

describe('isUndefined', () => {
  it('should return true if value is undefined', () => {
    // Primitives
    expect(isUndefined('key')).toBeFalsy();
    expect(isUndefined(1)).toBeFalsy();
    expect(isUndefined('false')).toBeFalsy();
    expect(isUndefined(false)).toBeFalsy();
    expect(isUndefined(true)).toBeFalsy();
    expect(isUndefined(null)).toBeFalsy();
    expect(isUndefined('null')).toBeFalsy();
    expect(isUndefined(undefined)).toBeTruthy();
    expect(isUndefined(NaN)).toBeFalsy();
    expect(isUndefined(Infinity)).toBeFalsy();
    expect(isUndefined('')).toBeFalsy();
  });
});
