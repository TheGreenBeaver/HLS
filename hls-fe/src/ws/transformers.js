import { toBuf, toStr } from '../util/misc';


const KINDS = {
  stream: 's',
  jsonLike: 'j'
};
const IDF = {
  file: 'f',
  fileArray: 'a',
  other: 'o'
};
const DELIMITER = ':';

async function processJsonLike(data) {
  // [kind][size of JSON part][delimiter][JSON part][...files as ArrayBuffers]
  const parts = [null, DELIMITER, null];
  let offset = 0;

  const _process = async (dataPiece) => {
    const res = {};

    for (const entry of Object.entries(dataPiece)) {
      const [fieldName, fieldValue] = entry;

      if (fieldValue === undefined) {
        continue;
      }

      if (fieldValue instanceof File) { // Single file
        const { size, name, type } = fieldValue;
        res[`${IDF.file}_${fieldName}`] = { size, name, type, offset };
        const buf = await fieldValue.arrayBuffer();
        parts.push(buf);
        offset += buf.byteLength;
        continue;
      }

      if (Array.isArray(fieldValue) && fieldValue[0] instanceof File) { // Array of files
        res[`${IDF.fileArray}_${fieldName}`] = [];
        for (const file of fieldValue) {
          const { size, name, type } = file;
          res[fieldName].push({ size, name, type, offset });
          const buf = await file.arrayBuffer();
          offset += buf.byteLength;
          parts.push(buf);
        }
        continue;
      }

      if (fieldValue?.constructor.name === 'Object') { // Nested JSON
        res[`${IDF.other}_${fieldName}`] = await _process(fieldValue);
        continue;
      }

      // Any other data
      res[`${IDF.other}_${fieldName}`] = fieldValue;
    }

    return res;
  };

  const cleanedUpData = await _process(data);
  const asString = JSON.stringify(cleanedUpData);
  const jsonPartSize = (await toBuf(asString)).byteLength;
  parts[0] = jsonPartSize.toString();
  parts[2] = asString;

  return parts;
}

/**
 *
 * @param {Object | Blob} data
 * @return {Promise<ArrayBuffer>}
 */
async function encode(data) {
  const isBlob = data instanceof Blob;
  const kind = isBlob ? KINDS.stream : KINDS.jsonLike;
  const payload = isBlob ? [data] : await processJsonLike(data);
  return toBuf(kind, ...payload);
}

/**
 *
 * @param {ArrayBuffer} data
 * @return {Promise<Object>}
 */
async function decode(data) {
  // Never sending raw file data server => client
  const asString = await toStr(data);
  return JSON.parse(asString);
}

export { encode, decode }