import React, { useEffect, useRef } from 'react';
import ws from '../../../ws';
import { useVideoEffect } from '../common';
import { RatioBox } from '../../layout';
import Button from '@mui/material/Button';
import { bool, func } from 'prop-types';
import Preloader from '../../preloader';
import Box from '@mui/material/Box';
import { useAlert } from '../../../util/hooks';


const TIME_SLICE = 500;

function VideoRecorder({ onFinish, processing }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const showAlert = useAlert();

  useVideoEffect(videoRef, video => {
    const initStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      video.srcObject = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });
      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          ws.sendStreamChunk(e.data);
        }
      };
      mediaRecorder.start(TIME_SLICE);
      mediaRecorderRef.current = mediaRecorder;
      showAlert('You are now live!', 'success');
    }

    initStream();
  });

  function stopRecording() {
    const mediaRecorder = mediaRecorderRef.current;
    mediaRecorder.ondataavailable = null;
    mediaRecorder.stream.getTracks().forEach(track => {
      if (track.readyState === 'live') {
        track.stop();
      }
    });
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  useEffect(() => stopRecording, []);

  return (
    <>
      <RatioBox>
        <video ref={videoRef} autoPlay width='100%' height='100%' muted />
      </RatioBox>
      <Box display='flex' justifyContent='flex-end' mt={1}>
        <Button
          onClick={() => {
            stopRecording();
            onFinish();
          }}
          disabled={processing}
          sx={{ display: 'flex', columnGap: 1 }}
          variant='outlined'
        >
          {processing && <Preloader size='1em' contrast />}
          Finish livestream
        </Button>
      </Box>
    </>
  );
}

VideoRecorder.propTypes = {
  onFinish: func.isRequired,
  processing: bool
};

export default VideoRecorder;