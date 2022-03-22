import { getVar } from '../util/env';
import WsWithQueue from './ws-with-queue';


const origin = getVar('REACT_APP_ORIGIN', window.location.origin);
const ws = new WsWithQueue(`ws://${origin}/ws`);

export default ws;