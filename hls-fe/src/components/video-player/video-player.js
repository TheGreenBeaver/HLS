import React, { useEffect, useRef, useState } from 'react';
import { string } from 'prop-types';
import Hls from 'hls.js';
import RatioBox from '../layout/ratio-box';
import Controls from './controls';
import {
  useControls,
  useCurrentTime,
  useMuted,
  usePaused,
  usePlaybackRate, useQuality,
  useTotalDuration,
  useVideoEffect,
  useVolume
} from './hooks';
import Box from '@mui/material/Box';
import { AUTO_LEVEL, calcSeekedTime } from './util';
import Slide from '@mui/material/Slide';
import Ripple from './ripple';


function VideoPlayer({ src, thumbnail }) {
  // > === === REFS === === >
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const videoContainerRef = useRef(null);
  // < === === REFS === === <

  // > === === DISPLAY === === >
  const [playbackMenuOpen, setPlaybackMenuOpen] = useState(false);
  const [rippleState, setRippleState] = useState(Ripple.STATE.none);
  const {
    scheduleControlsHide,
    controlsVisible,
    excludeControls,
    showControls,
    resetControls
  } = useControls(playbackMenuOpen);
  // < === === DISPLAY === === <

  // > === === VIDEO DATA === === >
  const [loadedTimeRanges, setLoadedTimeRanges] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const totalDuration = useTotalDuration(videoRef);
  const currentTimeData = useCurrentTime(videoRef);
  const pausedData = usePaused(videoRef, paused => {
    resetControls();
    setRippleState(paused ? Ripple.STATE.becamePaused : Ripple.STATE.becamePlaying);
  });
  const volumeData = useVolume(videoRef);
  const mutedData = useMuted(videoRef);
  const playbackRateData = usePlaybackRate(videoRef);
  const { qualityData, qualitySetters } = useQuality(videoRef, hlsRef);
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
          qualitySetters.setAvailableLevels([
            ...data.levels.map((lvl, idx) => ({ ...lvl, idx })),
            AUTO_LEVEL
          ]);
          setIsProcessing(false);
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, { level }) => {
          qualitySetters.setIsAutoLevel(hlsRef.current?.autoLevelEnabled);
          qualitySetters.setCurrentLevel(level);
        });

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
  useVideoEffect(videoRef, () => {
    const keyboardControlsListener = e => {
      switch (e.code) {
        case 'Space':
          pausedData.set(curr => !curr);
          break;
        case 'ArrowRight':
          currentTimeData.set(curr => calcSeekedTime(totalDuration, curr, true));
          break;
        case 'ArrowLeft':
          currentTimeData.set(curr => calcSeekedTime(totalDuration, curr, false));
          break;
        default:
          return;
      }

      resetControls();
    };

    document.addEventListener('keyup', keyboardControlsListener);

    return () => document.removeEventListener('keyup', keyboardControlsListener);
  }, [totalDuration]);

  return (
    <RatioBox
      ref={videoContainerRef}
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
      <Ripple rippleState={rippleState} setRippleState={setRippleState} />
      <video
        width='100%'
        height='auto'
        ref={videoRef}
        autoPlay={false}
        onMouseMove={e => excludeControls(e, resetControls)}
        onClick={e => excludeControls(e, () => pausedData.set(curr => !curr))}
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