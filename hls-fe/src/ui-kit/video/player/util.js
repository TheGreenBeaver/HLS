import { shape, func, oneOfType, number, bool, array, object } from 'prop-types';

const VIDEO_DATA_SHAPE = shape({
  val: oneOfType([bool, number, object]).isRequired,
  set: func.isRequired,
  available: array
});
const AUTO_LEVEL = -1;
const VIDEO_CONTROLS_ID = 'obs-video-controls-box';

const UPD_RATES = {
  currentTime: 200,
  volume: 250
}

const SEEK_INTERVAL = 0.05;
const MIN_SHIFT = 1;
function calcSeekedTime(
  totalDuration,
  currentTime,
  forward = true,
  seekInterval = SEEK_INTERVAL,
  minShift = MIN_SHIFT
) {
  if (totalDuration == null) {
    return currentTime;
  }

  const shift = Math.max(minShift, totalDuration * seekInterval);
  return forward
    ? Math.min(totalDuration, currentTime + shift)
    : Math.max(0, currentTime - shift);
}

export { VIDEO_DATA_SHAPE, AUTO_LEVEL, VIDEO_CONTROLS_ID, UPD_RATES, calcSeekedTime };