import { dispatchEvent } from '.';

describe('test utils', () => {
  describe('dispatchEvent', () => {
    it.each([
      ['click', document.createElement('div')],
      ['click', window],
      ['focus', window],
      ['blur', window],
      ['click', document],
      ['focus', document],
      ['blur', document],
      ['click', document.body],
      ['click', document.createElement('span')],
      ['click', document.createElement('section')],
    ])('should dispatch event "%s" in the passed DOM element %s', (eventName, el) => {
      const onEvent = vi.fn();

      el.addEventListener(eventName, onEvent);
      dispatchEvent(eventName, el);

      expect(onEvent).toHaveBeenCalledOnce();
    });
  });
});
