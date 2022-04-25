import React from 'react';
import EntityList from '../../../components/entity-list';
import ACTIONS from '../../../ws/actions';
import VideoEntity from '../../../components/entity-list/entities/video-entity';
import SearchBar, { SECTIONS } from '../../../components/search-bar';
import Divider from '@mui/material/Divider';
import { useParams } from 'react-router-dom';
import { useWsRequest } from '../../../ws/hooks';
import { CenterBox } from '../../../ui-kit/layout';
import Preloader from '../../../ui-kit/preloader';
import UserEntity from '../../../components/entity-list/entities/user-entity';
import Button from '@mui/material/Button';
import { useUserData } from '../../../store/selectors';
import ws from '../../../ws';
import Box from '@mui/material/Box';
import { Q } from '../../../util/constants';


function SingleChannel() {
  const { id } = useParams();
  const currentUserData = useUserData();

  const { isFetching, data: userData, setData } = useWsRequest(ACTIONS.retrieveUser, {
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

  return (
    <>
      <SearchBar section={SECTIONS.single} />

      <Box display='flex' columnGap={3}>
        <UserEntity data={userData} large />
        {
          currentUserData && currentUserData.id !== userData.id && !userData.isSubscribed &&
          <Button
            variant='outlined'
            onClick={() =>
              ws
                .request(ACTIONS.subscribe, { id: +id })
                .then(() => setData(curr => ({ ...curr, isSubscribed: true })))
            }
          >
            Subscribe
          </Button>
        }
      </Box>
      <Divider sx={{ my: 2 }} />
      <EntityList
        Entity={VideoEntity}
        actionName={ACTIONS.listVideos}
        composePayload={q => {
          const p = { filters: { author: +id } };
          if (q) {
            p.filters[Q] = q;
          }
          return p;
        }}
      />
    </>
  );
}

export default SingleChannel;