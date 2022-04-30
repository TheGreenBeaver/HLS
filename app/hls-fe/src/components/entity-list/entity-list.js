import React, { useEffect, useState } from 'react';
import { elementType, func, number, oneOf } from 'prop-types';
import ACTIONS from '../../ws/actions';
import Grid from '@mui/material/Grid';
import { useMountedState } from '../../util/hooks';
import ws from '../../ws';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Q } from '../../util/constants';
import Typography from '@mui/material/Typography';
import InfiniteScroll from '../../ui-kit/infinite-scroll';
import { useUserState } from '../../store/selectors';


function defaultComposePayload(q) {
  return q ? { [Q]: q } : {};
}

function EntityList({ Entity, actionName, composePayload, pageSize, filterByAuth }) {
  const { search } = useLocation();
  const { isAuthorized } = useUserState();
  const [hasMore, setHasMore] = useState(true);
  const [entities, setEntities] = useMountedState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setHasMore(true);
    setEntities([]);
  }, [search]);

  useEffect(() => {
    setEntities(curr => curr.filter(entity => filterByAuth(entity, isAuthorized)));
  }, [isAuthorized]);

  function loadMore(page, force) {
    if (isFetching || (!hasMore && !force)) {
      return;
    }
    setIsFetching(true);
    const parsedSearch = queryString.parse(search);
    const payload = { page, pageSize, ...composePayload(parsedSearch?.[Q]) };
    ws
      .request(actionName, payload)
      .then(({ payload }) => {
        setEntities(curr => [...curr, ...payload.results]);
        setHasMore(!!payload.next);
      })
      .finally(() => setIsFetching(false));
  }

  return (
    <InfiniteScroll
      loadMore={loadMore}
      hasMore={hasMore}
      isLoading={isFetching}
    >
      {
        !entities.length && !isFetching
          ? <Typography textAlign='center' variant='subtitle1' color='text.secondary'>Nothing here yet</Typography>
          : <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 12 }}>
            {entities.map((data, idx) => <Entity data={data} key={idx} />)}
          </Grid>
      }
    </InfiniteScroll>
  );
}

EntityList.propTypes = {
  Entity: elementType.isRequired,
  actionName: oneOf([...Object.values(ACTIONS)]).isRequired,
  pageSize: number,
  composePayload: func,
  filterByAuth: func
};

EntityList.defaultProps = {
  pageSize: 10,
  composePayload: defaultComposePayload
}

export default EntityList;