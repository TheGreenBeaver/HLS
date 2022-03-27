import { padStart } from 'lodash';


async function toBuf(...parts) {
  return (new Blob(parts)).arrayBuffer();
}

async function toStr(buf) {
  return (new Blob([buf])).text();
}

function getTimeDisplay(valInSeconds) {
  const roundedVal = Math.floor(valInSeconds);
  const sec = roundedVal % 60;
  const min = Math.floor(roundedVal / 60) % 60;
  const h = Math.floor(roundedVal / 60 / 60);

  return `${h ? `${h}:` : ''}${min}:${padStart(`${sec}`, 2, '0')}`
}

function getUpd(upd, curr) {
  return typeof upd === 'function' ? upd(curr) : upd;
}

/**
 *
 * @param {File} rawFile
 * @param {function(res: string | ArrayBuffer)} cb
 */
function readFile(rawFile, cb) {
  const fr = new FileReader();
  fr.onload = loadEv => cb(loadEv.target.result);
  fr.readAsDataURL(rawFile);
}

export {
  toBuf, toStr, getTimeDisplay, getUpd, readFile
};