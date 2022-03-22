import React, { useEffect, useRef, useState } from 'react';
import { string } from 'prop-types';
import Hls from 'hls.js';
import RatioBox from '../layout/ratio-box';
import Controls from './controls';
import {
  useCurrentTime,
  useMuted,
  usePaused,
  usePlaybackRate,
  useTotalDuration,
  useVideoEffect,
  useVolume
} from './hooks';
import Box from '@mui/material/Box';
import { AUTO_LEVEL } from './util';
import Slide from '@mui/material/Slide';


const HIDE_CONTROLS_DELAY = 2000;

function VideoPlayer({ src, thumbnail }) {
  // > === === REFS === === >
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const videoContainerRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  // < === === REFS === === <

  // > === === DISPLAY === === >
  const [controlsVisible, setControlsVisible] = useState(false);
  const [playbackMenuOpen, setPlaybackMenuOpen] = useState(false);

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
  // < === === DISPLAY === === <

  // > === === VIDEO STATISTICS === === >
  const totalDuration = useTotalDuration(videoRef);
  const [loadedTimeRanges, setLoadedTimeRanges] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  // < === === VIDEO STATISTICS === === <

  // > === === VIDEO DATA === === >
  const [availableLevels, setAvailableLevels] = useState([]);
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

  const currentTimeData = useCurrentTime(videoRef);
  const pausedData = usePaused(videoRef, () => {
    showControls();
    scheduleControlsHide();
  });
  const volumeData = useVolume(videoRef);
  const mutedData = useMuted(videoRef);
  const playbackRateData = usePlaybackRate(videoRef);
  const qualityData = {
    val: availableLevels[currentLevel] || AUTO_LEVEL,
    set: changeLevel,
    available: availableLevels
  };
  // < === === VIDEO DATA === === <

  // > === === HLS INITIALIZATION + CLEANUP === === >
  useVideoEffect(videoRef, video => {
    setIsProcessing(true);

    if (Hls.isSupported()) {
      const hls = new Hls();

      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(src);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setAvailableLevels([
            ...data.levels.map((lvl, idx) => ({ ...lvl, idx })),
            AUTO_LEVEL
          ]);
          setIsProcessing(false);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, { level }) =>
          setCurrentLevel(level)
        );

        hls.on(Hls.Events.BUFFER_FLUSHED, () =>
          setLoadedTimeRanges(null)
        );

        hls.on(Hls.Events.BUFFER_APPENDED, (_, bufData) =>
          setLoadedTimeRanges(bufData.timeRanges.video)
        );
      });

      hlsRef.current = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      // TODO: Native mode
    }
  }, [src]);

  useEffect(() => () => hlsRef.current?.destroy(), []);
  // < === === HLS INITIALIZATION + CLEANUP === === <

  // > === === RENDERING === === >
  return (
    <RatioBox
      ref={videoContainerRef}
      onMouseMove={() => {
        showControls();
        scheduleControlsHide();
      }}
      sx={{ overflow: 'hidden' }}
    >
      {
        isProcessing &&
        <Box
          component='img'
          src={thumbnail}
          alt='thumbnail'
          width='100%'
          height='auto'
          position='absolute'
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={5}
        />
      }
      <video
        width='100%'
        height='auto'
        ref={videoRef}
        autoPlay={false}
        onClick={() => pausedData.set(curr => !curr)}
      />
      {
        !!videoRef.current &&
        <Slide
          direction='up'
          container={videoContainerRef.current}
          in={controlsVisible || pausedData.val}
        >
          <Controls
            currentTimeData={currentTimeData}
            pausedData={pausedData}
            volumeData={volumeData}
            mutedData={mutedData}
            playbackRateData={playbackRateData}
            qualityData={qualityData}

            containerRef={videoContainerRef}

            totalDuration={totalDuration}
            loadedTimeRanges={loadedTimeRanges}

            showControls={showControls}
            scheduleControlsHide={scheduleControlsHide}

            playbackMenuOpen={playbackMenuOpen}
            setPlaybackMenuOpen={setPlaybackMenuOpen}
          />
        </Slide>
      }
    </RatioBox>
  );
  // < === === RENDERING === === <
}

VideoPlayer.propTypes = {
  src: string.isRequired,
  thumbnail: string.isRequired
};

export default VideoPlayer;