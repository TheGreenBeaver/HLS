import React from 'react';
import SearchBar, { SECTIONS } from '../../../components/search-bar';
import EntityList from '../../../components/entity-list';
import ConditionalEntity, { KINDS } from './conditional-entity';
import ACTIONS from '../../../ws/actions';


function Search() {
  return (
    <>
      <SearchBar section={SECTIONS.search} />
      <EntityList
        Entity={ConditionalEntity}
        actionName={ACTIONS.search}
        filterByAuth={(entity, isAuthorized) =>
          isAuthorized || entity.kind === KINDS.user || !!entity.mainData.location
        }
      />
    </>
  );
}

export default Search;