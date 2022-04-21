import React from 'react';
import { object, bool } from 'prop-types';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import { links } from '../../../pages/routing';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';


function UserEntity({ data, large }) {
  const sz = 100;
  const content =
    <Box display='flex' alignItems='center' columnGap={2} width='100%'>
      <Avatar src={data.avatar} sx={{ height: sz, width: sz }}>
        {data.username[0]}
      </Avatar>
      <Box>
        <Typography variant='subtitle1' display='block' color='text.primary'>
          {data.username}
        </Typography>
        <Typography variant='caption' display='block' color='text.secondary'>
          Member since {DateTime.fromISO(data.createdAt).toFormat('DD')}
        </Typography>
        <Typography variant='caption' display='block' color='text.secondary'>
          {data.subscribersAmount} subscribers{data.isSubscribed ? ' | You are subscribed' : ''}
        </Typography>
      </Box>
    </Box>;

  return large
    ? content
    : <Grid item xs={4} sm={12}>
      <Link to={links.channels.single.get(data.id)}>
        {content}
      </Link>
    </Grid>;
}

UserEntity.propTypes = {
  data: object.isRequired,
  large: bool
};

export default UserEntity;