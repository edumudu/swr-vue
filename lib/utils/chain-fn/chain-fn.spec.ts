import { chainFns } from '.';

describe('chainFn', () => {
  it('should call all cahined functions', () => {
    const functions = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    const chainedFn = chainFns(...functions);

    chainedFn();

    functions.forEach((fn) => expect(fn).toHaveBeenCalledOnce());
  });

  it('should call all chained functions with the same arguments', () => {
    const functions = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    const chainedFn = chainFns(...functions);

    chainedFn('arg1', 'arg2', 3);

    functions.forEach((fn) => expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 3));
  });
});
