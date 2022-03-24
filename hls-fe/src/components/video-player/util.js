import { shape, func, oneOfType, number, bool, array, object } from 'prop-types';

const VIDEO_DATA_SHAPE = shape({
  val: oneOfType([bool, number, object]).isRequired,
  set: func.isRequired,
  available: array
});
const AUTO_LEVEL = -1;
const VIDEO_CONTROLS_ID = 'obs-video-controls-box';

export { VIDEO_DATA_SHAPE, AUTO_LEVEL, VIDEO_CONTROLS_ID };