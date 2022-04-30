import React from 'react';
import ACTIONS from '../../../ws/actions';
import SearchBar, { SECTIONS } from '../../../components/search-bar';
import EntityList from '../../../components/entity-list';
import VideoEntity from '../../../components/entity-list/entities/video-entity';


function VideosList() {
  return (
    <>
      <SearchBar section={SECTIONS.search} />
      <EntityList
        Entity={VideoEntity}
        actionName={ACTIONS.listVideos}
        filterByAuth={(v, isAuthorized) => isAuthorized || !!v.location}
      />
    </>
  );
}

export default VideosList;