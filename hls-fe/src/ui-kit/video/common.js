import { useIsMounted } from '../../util/hooks';
import { useEffect } from 'react';

/**
 * @typedef VideoRef
 * @type {Object}
 * @property {HTMLVideoElement} current
 */
/**
 *
 * @param {VideoRef} videoRef
 * @param {function(video: HTMLVideoElement)} effect
 * @param {Array<*>} [extraDeps = []]
 */
function useVideoEffect(videoRef, effect, extraDeps = []) {
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!videoRef.current || !isMounted.current) {
      return;
    }

    return effect(videoRef.current);
  }, [videoRef, ...extraDeps]);
}

export { useVideoEffect };