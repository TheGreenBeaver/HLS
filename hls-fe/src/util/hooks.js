import { useRef } from 'react';
import * as _ from 'lodash';


/**
 *
 * @param {function} fn
 * @param {number} updRate
 * @param {'throttle'|'debounce'} delayer
 * @param {boolean} [leading = true]
 * @return {function}
 */
function useDelayedFn(fn, updRate, delayer, leading = true) {
  const delayedFnRef = useRef(_[delayer](fn, updRate, { leading }));

  return (...args) => {
    delayedFnRef.current.cancel();
    delayedFnRef.current(...args);
  };
}

export { useDelayedFn };