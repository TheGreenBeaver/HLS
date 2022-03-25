import { useEffect, useRef, useState } from 'react';
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

function usePopover() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  function openMenu() {
    setOpen(true);
  }

  return {
    triggerProps: { ref: anchorRef, onClick: openMenu },
    popoverProps: {
      anchorEl: anchorRef.current,
      open: !!anchorRef.current && open,
      onClose: closeMenu
    },
    closeMenu
  };
}

function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false };
  }, []);

  return isMounted;
}

function useMountedState(initialState) {
  const isMounted = useIsMounted();
  const [state, setState] = useState(initialState);

  function setStateIfMounted(upd) {
    if (isMounted.current) {
      setState(upd);
    }
  }

  return [state, setStateIfMounted];
}

export { useDelayedFn, usePopover, useMountedState, useIsMounted };