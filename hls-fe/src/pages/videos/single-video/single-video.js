import React from 'react';
import { useParams } from 'react-router-dom';
import { useWsRequest } from '../../../ws/hooks';
import ACTIONS from '../../../ws/actions';
import VideoPlayer from '../../../components/video-player';
import Typography from '@mui/material/Typography';


function SingleVideo() {
  const { id } = useParams();

  const { isFetching, data } = useWsRequest(ACTIONS.retrieveVideo, { id }, !!id, [id]);

  if (isFetching) {
    return 'Loading video...';
  }

  return (
    <>
      <Typography variant='h4'>{data.name}</Typography>
      <VideoPlayer src={data.location} thumbnail={data.thumbnail} />
    </>
  );
}

export default SingleVideo;