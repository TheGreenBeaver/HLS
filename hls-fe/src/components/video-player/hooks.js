import { useEffect, useRef, useState } from 'react';
import { useDelayedFn } from '../../util/hooks';

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
  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    effect(videoRef.current);
  }, [videoRef, ...extraDeps]);
}

/**
 * @template T
 * @param {T} initialValue
 * @param {number} updRate
 * @return {{ val: T, respondToEvent: function, forceNewState: function }}
 */
function useThrottledState(initialValue, updRate) {
  const [state, setState] = useState(initialValue);
  const respondToEvent = useDelayedFn(setState, updRate, 'throttle');

  return { val: state, respondToEvent, forceNewState: setState };
}

/**
 *
 * @param {VideoRef} videoRef
 * @param {string} fieldName
 * @param {string} eventName
 * @param {number} initialValue
 * @param {number} updRate
 * @return {{ val: number, set: function }}
 */
function useNumeric(
  videoRef,
  fieldName,
  eventName,
  initialValue,
  updRate,
) {
  const { val, respondToEvent, forceNewState } = useThrottledState(initialValue, updRate);

  useVideoEffect(videoRef, video => {
    forceNewState(video[fieldName]);
    video[`on${eventName}`] = () => {
      respondToEvent(video[fieldName]);
    };
  });

  function set(upd) {
    const video = videoRef.current;
    video[fieldName] = typeof upd === 'function' ? upd(video[fieldName]) : upd;
  }

  return { val, set };
}

/**
 *
 * @param {VideoRef} videoRef
 * @param {number} [updRate = 250]
 * @return {{ val: number, set: function }}
 */
function useCurrentTime(videoRef, updRate = 250) {
  return useNumeric(
    videoRef, 'currentTime', 'timeupdate', 0, updRate
  );
}

/**
 *
 * @param {VideoRef} videoRef
 * @return {{ val: boolean, set: function }}
 */
function usePaused(videoRef) {
  const [paused, setPaused] = useState(false);
  const [canUpdate, setCanUpdate] = useState(true);
  const enqueued = useRef(null);

  useVideoEffect(videoRef, video => {
    setPaused(video.paused);
    video.onpause = () => setPaused(true);
    video.onplay = () => setPaused(false);
  });

  function change(shouldBePaused) {
    const video = videoRef.current;
    if (shouldBePaused && !video.paused) {
      video.pause()
    } else if (!shouldBePaused && video.paused) {
      setCanUpdate(false);
      video.play().then(() => setCanUpdate(true));
    }
  }

  useEffect(() => {
    if (canUpdate && enqueued.current != null) {
      change(enqueued.current);
      enqueued.current = null;
    }
  }, [canUpdate]);

  function set(upd) {
    const video = videoRef.current;
    const shouldBePaused = typeof upd === 'function'
      ? upd(video.paused)
      : upd;

    if (!canUpdate) {
      enqueued.current = shouldBePaused;
      return;
    }

    change(shouldBePaused);
  }

  return { val: paused, set };
}


/**
 *
 * @param {VideoRef} videoRef
 * @param {number} [updRate = 250]
 * @return {{ val: number, set: function }}
 */
function useVolume(videoRef, updRate = 250) {
  return useNumeric(videoRef,'volume', 'volumechange', 1, updRate);
}

/**
 *
 * @param {VideoRef} videoRef
 * @return {{ val: boolean, set: function }}
 */
function useMuted(videoRef) {
  const [muted, setMuted] = useState(false);

  useVideoEffect(videoRef, video => {
    setMuted(video.muted);
  });

  function set(upd) {
    const video = videoRef.current;
    const shouldBeMuted = typeof upd === 'function' ? upd(video.muted) : upd;
    video.muted = shouldBeMuted;
    setMuted(shouldBeMuted);
  }

  return { val: muted, set };
}

const AVAILABLE_PLAYBACK_RATES = [...Array(8)].map((_, m) => (m + 1) * 0.25);
/**
 *
 * @param {VideoRef} videoRef
 * @return {{ val: number, set: function, available: Array<number> }}
 */
function usePlaybackRate(videoRef) {
  const [playbackRate, setPlaybackRate] = useState(1);

  useVideoEffect(videoRef, video => {
    setPlaybackRate(video.playbackRate);
    video.onratechange = () => {
      setPlaybackRate(video.playbackRate);
    };
  });

  function set(upd) {
    const video = videoRef.current;
    video.playbackRate = typeof upd === 'function' ? upd(video.playbackRate) : upd;
  }
  return { val: playbackRate, set, available: AVAILABLE_PLAYBACK_RATES };
}

/**
 *
 * @param {VideoRef} videoRef
 */
function useTotalDuration(videoRef) {
  const [totalDuration, setTotalDuration] = useState(null);

  const changeDuration = useDelayedFn(setTotalDuration, 250, 'debounce', false);
  useVideoEffect(videoRef, video => {
    video.ondurationchange = () => changeDuration(video.duration);
  });

  return totalDuration;
}

export {
  useVideoEffect,

  useCurrentTime,
  usePaused,
  useVolume, useMuted,
  usePlaybackRate,

  useTotalDuration
}