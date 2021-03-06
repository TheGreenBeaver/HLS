import React from 'react';
import { object } from 'prop-types';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import { links } from '../../../pages/routing';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';


function UserEntity({ data }) {
  return (
    <Grid item xs={4} sm={12}>
      <Link to={links.channels.single.get(data.id)}>
        <Box display='flex' alignItems='center' columnGap={2}>
          <Avatar src={data.avatar}>
            {data.username[0]}
          </Avatar>
          <Box>
            <Typography variant='subtitle1' display='block' color='text.primary'>
              {data.username}
            </Typography>
            <Typography variant='caption' display='block' color='text.secondary'>
              Member since {DateTime.fromISO(data.createdAt).toFormat('DD')}
            </Typography>
          </Box>
        </Box>
      </Link>
    </Grid>
  );
}

UserEntity.propTypes = {
  data: object.isRequired
};

export default UserEntity;