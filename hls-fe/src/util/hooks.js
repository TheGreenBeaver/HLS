import { useRef, useState } from 'react';
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

const TRIGGER = 'trigger';
function useTrigger() {
  const [trigger, setTrigger] = useState(Symbol(TRIGGER));
  return [trigger, () => setTrigger(Symbol(TRIGGER))];
}

export { useDelayedFn, useTrigger };