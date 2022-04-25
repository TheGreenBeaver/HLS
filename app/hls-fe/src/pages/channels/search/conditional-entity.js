import React from 'react';
import { object, oneOf, shape } from 'prop-types';
import UserEntity from '../../../components/entity-list/entities/user-entity';
import VideoEntity from '../../../components/entity-list/entities/video-entity';


const KINDS = {
  video: 'video',
  user: 'user',
};

function ConditionalEntity({ data: { kind, mainData } }) {
  const TheEntity = kind === KINDS.user ? UserEntity : VideoEntity;
  return <TheEntity data={mainData} large={kind === KINDS.video} />;
}

ConditionalEntity.propTypes = {
  data: shape({
    mainData: object.isRequired,
    kind: oneOf([...Object.values(KINDS)]).isRequired
  }).isRequired
};

export default ConditionalEntity;