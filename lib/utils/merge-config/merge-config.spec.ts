import { mergeConfig } from '.';

describe('mergeConfig', () => {
  it.each([
    [{}, { revalidateIfStale: true }, { revalidateIfStale: true }],
    [{ revalidateIfStale: true }, {}, { revalidateIfStale: true }],
    [{ revalidateIfStale: true }, { revalidateIfStale: true }, { revalidateIfStale: true }],
    [{ revalidateIfStale: false }, { revalidateIfStale: true }, { revalidateIfStale: true }],
    [{ revalidateIfStale: true }, { revalidateIfStale: false }, { revalidateIfStale: false }],
    [
      { revalidateIfStale: false, revalidateOnFocus: true },
      { revalidateIfStale: false },
      { revalidateIfStale: false, revalidateOnFocus: true },
    ],
    [
      { revalidateIfStale: true },
      { revalidateIfStale: true, revalidateOnFocus: true },
      { revalidateIfStale: true, revalidateOnFocus: true },
    ],
  ])('should merge two configs: %s', (obj1, obj2, expectedResult) => {
    expect(mergeConfig(obj1, obj2)).toEqual(expectedResult);
  });

  it('should also merge callbacks', () => {
    const globalConfig = Object.freeze({
      onError: vi.fn(),
      onSuccess: vi.fn(),
    });

    const localConfig = Object.freeze({
      onError: vi.fn(),
      onSuccess: vi.fn(),
    });

    const { onError, onSuccess } = mergeConfig(globalConfig, localConfig);

    onError();
    onSuccess();

    expect(globalConfig.onSuccess).toHaveBeenCalledOnce();
    expect(globalConfig.onError).toHaveBeenCalledOnce();
    expect(localConfig.onSuccess).toHaveBeenCalledOnce();
    expect(localConfig.onError).toHaveBeenCalledOnce();
  });

  it('should not throw when one of the callbacks is missing', () => {
    const globalConfig = Object.freeze({ onSuccess: vi.fn() });
    const localConfig = Object.freeze({ onError: vi.fn() });

    const { onError, onSuccess } = mergeConfig(globalConfig, localConfig);

    onError();
    onSuccess();

    expect(globalConfig.onSuccess).toHaveBeenCalledOnce();
    expect(localConfig.onError).toHaveBeenCalledOnce();
  });

  it('should return undefined when callback is missing in either configs', () => {
    const { onError, onSuccess } = mergeConfig({}, {});

    expect(onError).toBeUndefined();
    expect(onSuccess).toBeUndefined();
  });
});
