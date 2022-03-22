async function toBuf(...parts) {
  return (new Blob(parts)).arrayBuffer();
}

async function toStr(buf) {
  return (new Blob([buf])).text();
}

export {
  toBuf, toStr
};