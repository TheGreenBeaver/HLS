import { Duration } from 'luxon';


async function toBuf(...parts) {
  return (new Blob(parts)).arrayBuffer();
}

async function toStr(buf) {
  return (new Blob([buf])).text();
}

function getTimeDisplay(valInSeconds) {
  const dur = Duration.fromMillis(valInSeconds * 1000);
  return dur.toFormat(dur.hours ? 'hh:mm:ss' : 'mm:ss');
}

function getUpd(upd, curr) {
  return typeof upd === 'function' ? upd(curr) : upd;
}

function blockEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}

const UNITS = { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB', TB: 'TB' };

const unitsPower = Object.values(UNITS);
const bytesPerPower = 1024;

function unitToBytes(val, unit) {
  const power = unitsPower.indexOf(unit);
  return val * Math.pow(bytesPerPower, power);
}

function bytesToUnit(byteVal) {
  let unitIdx = 0;
  let val = byteVal;
  while (val >= bytesPerPower && unitIdx < unitsPower.length) {
    val /= bytesPerPower;
    unitIdx++;
  }
  return `${val.toFixed(2)} ${unitsPower[unitIdx]}`;
}

export { toBuf, toStr, getTimeDisplay, getUpd, blockEvent, UNITS, bytesToUnit, unitToBytes };