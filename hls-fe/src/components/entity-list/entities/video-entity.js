import React from 'react';
import { object } from 'prop-types';
import { Link } from 'react-router-dom';
import { links } from '../../../pages/routing';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import PulseDot from '../../../ui-kit/pulse-dot';
import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';


function getTimingText({ isLiveNow, plan, createdAt, location, isStream }) {
  if (isLiveNow) {
    return 'LIVE';
  }

  if (!location && plan) {
    return `Stream will start ${DateTime.fromISO(plan).toRelative()}`;
  }

  return `${isStream ? 'Streamed ' : ''}${DateTime.fromISO(createdAt).toRelative()}`
}

function VideoEntity({ data }) {
  return (
    <Grid item xs={2} sm={4} lg={3}>
      <Link to={links.videos.single.get(data.id)}>
        <img src={data.thumbnail} alt={data.name} height='auto' width='100%' />
        <Box display='flex' columnGap={1}>
          <Avatar src={data.author.avatar}>
            {data.author.username[0]}
          </Avatar>
          <Box pt={0.5}>
            <Typography color='text.primary'>
              {data.name}
            </Typography>
            <Typography color='text.secondary' variant='caption' display='block' lineHeight={1.2}>
              {data.author.username}
            </Typography>
            <Box display='flex' alignItems='center' columnGap={1}>
              {data.isLiveNow && <PulseDot />}
              <Typography color='text.secondary' variant='caption' display='block' lineHeight={1.2}>
                {getTimingText(data)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Link>
    </Grid>
  );
}

VideoEntity.propTypes = {
  data: object.isRequired
};

export default VideoEntity;