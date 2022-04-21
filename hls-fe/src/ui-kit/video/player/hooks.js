import { useEffect, useRef, useState } from 'react';
import { useDelayedFn, useMountedState } from '../../../util/hooks';
import { AUTO_LEVEL, UPD_RATES, VIDEO_CONTROLS_ID } from './util';
import { getUpd } from '../../../util/misc';
import { useVideoEffect } from '../common';

/**
 * @template T
 * @param {T} initialValue
 * @param {number} updRate
 * @return {{ val: T, respondToEvent: function, forceNewState: function }}
 */
function useThrottledState(initialValue, updRate) {
  const [state, setState] = useMountedState(initialValue);
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

    return () => { video[`on${eventName}`] = null; };
  });

  function set(upd) {
    const video = videoRef.current;
    video[fieldName] = getUpd(upd, video[fieldName]);
  }

  return { val, set };
}

/**
 *
 * @param {VideoRef} videoRef
 * @param {number} [updRate = 250]
 * @return {{ val: number, set: function }}
 */
function useCurrentTime(videoRef, updRate = UPD_RATES.currentTime) {
  return useNumeric(
    videoRef, 'currentTime', 'timeupdate', 0, updRate
  );
}

/**
 *
 * @param {VideoRef} videoRef
 * @param {function(paused: boolean)} onChange
 * @return {{ val: boolean, set: function }}
 */
function usePaused(videoRef, onChange) {
  const [paused, setPaused] = useState(true);
  const [canUpdate, setCanUpdate] = useState(true);
  const enqueued = useRef(null);
  const firstTime = useRef(true);

  useVideoEffect(videoRef, video => {
    setPaused(video.paused);
    video.onpause = () => setPaused(true);
    video.onplay = () => setPaused(false);

    return () => {
      video.onpause = null;
      video.onplay = null;
    }
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
    if (!firstTime.current) {
      onChange(paused);
    } else {
      firstTime.current = false;
    }
  }, [paused]);

  useEffect(() => {
    if (canUpdate && enqueued.current != null) {
      change(enqueued.current);
      enqueued.current = null;
    }
  }, [canUpdate]);

  function set(upd) {
    const video = videoRef.current;
    const shouldBePaused = getUpd(upd, video.paused);

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
function useVolume(videoRef, updRate = UPD_RATES.volume) {
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
    const shouldBeMuted = getUpd(upd, video.muted);
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

    return () => { video.onratechange = null; };
  });

  function set(upd) {
    const video = videoRef.current;
    video.playbackRate = getUpd(upd, video.playbackRate);
  }
  return { val: playbackRate, set, available: AVAILABLE_PLAYBACK_RATES };
}

/**
 * @typedef AvailableArr
 * @type Array<Object | number>
 */
/**
 *
 * @param {VideoRef} videoRef
 * @param {{ current: Object }} hlsRef
 * @return {{
 *  qualityData: {
 *    val: Object | number,
 *    set: function,
 *    available: AvailableArr
 *  },
 *  qualitySetters: {
 *    setIsAutoLevel: function(((curr: boolean) => boolean) | boolean),
 *    setAvailableLevels: function(((curr: AvailableArr) => AvailableArr) | AvailableArr),
 *    setCurrentLevel: function(((curr: number) => number) | number)
 *  }
 * }}
 */
function useQuality(videoRef, hlsRef) {
  const [availableLevels, setAvailableLevels] = useState([]);
  const [isAutoLevel, setIsAutoLevel] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(AUTO_LEVEL);

  function changeLevel(upd) {
    if (upd === AUTO_LEVEL) {
      hlsRef.current.currentLevel = upd;
      return;
    }
    hlsRef.current.currentLevel = typeof upd === 'function'
      ? upd(hlsRef.current.currentLevel)
      : upd.idx;
  }

  return {
    qualityData: {
      val: availableLevels[currentLevel] ? {
        ...availableLevels[currentLevel], isAutoLevel
      } : AUTO_LEVEL,
      set: changeLevel,
      available: availableLevels
    },
    qualitySetters: { setAvailableLevels, setIsAutoLevel, setCurrentLevel }
  };
}

/**
 *
 * @param {{ current: HTMLElement }} containerRef
 * @return {{ isProcessing: boolean, toggle: function(): Promise<void>, isFullScreen: boolean }}
 */
function useFullScreen(containerRef) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);

    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  async function toggle() {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    if (isFullScreen) {
      await document.exitFullscreen();
    } else {
      await containerRef.current?.requestFullscreen();
    }
    setIsProcessing(false);
  }

  return { toggle, isProcessing, isFullScreen };
}

/**
 *
 * @param {VideoRef} videoRef
 */
function useTotalDuration(videoRef) {
  const [totalDuration, setTotalDuration] = useMountedState(null);

  const changeDuration = useDelayedFn(setTotalDuration, 250, 'debounce', false);
  useVideoEffect(videoRef, video => {
    video.ondurationchange = () => changeDuration(video.duration);

    return () => { video.ondurationchange = null; };
  });

  return totalDuration;
}

const HIDE_CONTROLS_DELAY = 2000;

/**
 *
 * @param {boolean} playbackMenuOpen
 * @return {{
 *  scheduleControlsHide: function(force: boolean=),
 *  excludeControls: function(e: MouseEvent, fn: function(e: MouseEvent)),
 *  controlsVisible: boolean,
 *  showControls: function,
 *  resetControls: function
 * }}
 */
function useControls(playbackMenuOpen) {
  const hideControlsTimeoutRef = useRef(null);
  const [controlsVisible, setControlsVisible] = useMountedState(false);

  function showControls() {
    clearTimeout(hideControlsTimeoutRef.current);
    setControlsVisible(true);
  }

  function scheduleControlsHide(force) {
    if (!playbackMenuOpen || force) {
      hideControlsTimeoutRef.current = setTimeout(
        () => setControlsVisible(false), HIDE_CONTROLS_DELAY
      );
    }
  }

  function excludeControls(e, fn) {
    // Doing this via id because ref is used by Slide
    if (!document.getElementById(VIDEO_CONTROLS_ID)?.contains(e.target)) {
      return fn(e);
    }
  }

  function resetControls() {
    showControls();
    scheduleControlsHide();
  }

  return { showControls, scheduleControlsHide, excludeControls, resetControls, controlsVisible };
}

export {
  useCurrentTime,
  usePaused,
  useVolume, useMuted,
  usePlaybackRate,
  useQuality,
  useFullScreen,

  useTotalDuration,

  useControls
}