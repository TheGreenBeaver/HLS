import React, { useState } from 'react';
import ACTIONS from '../../../ws/actions';
import { links } from '../routing';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import RatioBox from '../../../components/layout/ratio-box';
import InfiniteScroll from 'react-infinite-scroller';
import ws from '../../../ws';


function VideosList() {
  const [hasMore, setHasMore] = useState(true);
  const [videos, setVideos] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  function loadMore(page) {
    if (isFetching) {
      return;
    }
    setIsFetching(true);
    ws
      .request(ACTIONS.listVideos, { page })
      .then(({ payload }) => {
        setVideos(curr => [...curr, ...payload.results]);
        setHasMore(!!payload.next);
      })
      .finally(() => setIsFetching(false));
  }

  return (
    <InfiniteScroll
      hasMore={hasMore}
      loadMore={loadMore}
      loader={isFetching ? <div key={0}>...</div> : null}
    >
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 12, lg: 12 }}>
        {
          videos.map(v =>
            <Grid item xs={2} sm={4} lg={3} key={v.id}>
              <RatioBox Component={Link} to={links.single.get(v.id)}>
                <img src={v.thumbnail} alt={v.name} height='auto' width='100%' />
                <Typography
                  variant='body1'
                  sx={{ position: 'absolute', bottom: 0, right: 0, width: '100%', p: 1 }}
                >
                  {v.name}
                </Typography>
              </RatioBox>
            </Grid>
          )
        }
      </Grid>
    </InfiniteScroll>
  );
}

export default VideosList;