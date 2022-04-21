import React from 'react';
import { useParams } from 'react-router-dom';
import { useWsRequest } from '../../../ws/hooks';
import ACTIONS from '../../../ws/actions';
import VideoPlayer from '../../../ui-kit/video/player';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Preloader from '../../../ui-kit/preloader';
import { CenterBox } from '../../../ui-kit/layout';
import PulseDot from '../../../ui-kit/pulse-dot';
import Avatar from '@mui/material/Avatar';


function SingleVideo() {
  const { id } = useParams();

  const { isFetching, data } = useWsRequest(ACTIONS.retrieveVideo, {
    getPayload: currId => ({ id: +currId }),
    condition: !!id,
    deps: [id],
    initialData: null
  });

  if (isFetching) {
    return (
      <CenterBox flex={1}>
        <Preloader size={100}/>
      </CenterBox>
    );
  }

  function getNotReadyText() {
    return data.plan
      ? `Livestream will start ${DateTime.fromISO(data.plan).toRelative()}`
      : 'Still processing...';
  }

  function getTimingText() {
    if (data.isLiveNow) {
      return 'LIVE';
    }

    const aboutStream = data.isStream ? 'Streamed on ' : '';
    return `${aboutStream}${DateTime.fromISO(data.createdAt).toFormat('DD')}`;
  }

  return (
    <>
      {
        data.location
          ? <VideoPlayer src={data.location} thumbnail={data.thumbnail} />
          : <Box position='relative'>
            <img src={data.thumbnail} alt='thumbnail' width='100%' style={{ filter: 'grayscale(1)' }} />
            <Box
              display='flex'
              sx={{ transform: 'translateX(-50%) translateY(-50%)' }}
              position='absolute'
              top='50%'
              left='50%'
              zIndex={3}
              columnGap={1}
              alignItems='center'
            >
              {!data.plan && <Preloader size='1.5rem' />}
              <Typography color='common.white' variant='h5'>
                {getNotReadyText()}
              </Typography>
            </Box>
          </Box>
      }

      <Typography variant='h5' mt={1}>{data.name}</Typography>
      {
        !!data.location &&
        <Box display='flex' alignItems='center' columnGap={1} mt={0.5}>
          {data.isLiveNow && <PulseDot />}
          <Typography variant='caption' color='text.secondary' fontSize='1em' display='block'>
            {getTimingText()}
          </Typography>
        </Box>
      }
      <Divider sx={{ my: 1 }} />
      <Box display='flex' alignItems='center' columnGap={1}>
        <Avatar src={data.author.avatar}>
          {data.author.username[0]}
        </Avatar>
        <Typography variant='subtitle1'>{data.author.username}</Typography>
      </Box>
      <Typography mt={1} color={data.description ? 'text.primary' : 'text.secondary'}>
        {data.description || 'No description provided'}
      </Typography>
    </>
  );
}

export default SingleVideo;