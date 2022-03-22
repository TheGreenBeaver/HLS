const { omit } = require('lodash');


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

function getFileData(fileStats, filePartStart, asBuf) {
  const { offset, size } = fileStats;
  const fileDataStart = filePartStart + offset;
  const relatedFileData = asBuf.slice(fileDataStart, fileDataStart + size + 1);
  return { ...omit(fileStats, 'offset'), data: relatedFileData };
}

/**
 *
 * @param {Buffer} asBuf
 * @param {string} asString
 */
function processJsonLike(asBuf, asString) {
  const delimiterPos = asString.indexOf(DELIMITER);
  const jsonPartSize = parseInt(asString.substring(1, delimiterPos));
  const jsonPartEnd = delimiterPos + jsonPartSize + 1;
  const jsonLikeAsString = asBuf.slice(delimiterPos + 1, jsonPartEnd).toString();
  const jsonLike = JSON.parse(jsonLikeAsString);

  const _process = dataPiece => {
    const res = {};
    for (const entry of Object.entries(dataPiece)) {
      const [fullFieldName, fieldValue] = entry;
      const fieldName = fullFieldName.replace(/^[fao]_/, '');

      switch (fullFieldName[0]) {
        case IDF.file:
          res[fieldName] = getFileData(fieldValue, jsonPartEnd, asBuf);
          break;
        case IDF.fileArray:
          res[fieldName] = fieldValue.map(fileStats => getFileData(fileStats, jsonPartEnd, asBuf));
          break;
        case IDF.other:
          res[fieldName] = fieldValue?.constructor.name === 'Object' ? _process(fieldValue) : fieldValue;
      }
    }

    return res;
  };

  return _process(jsonLike);
}

/**
 * @param {Object} data
 * @return {Buffer}
 */
function encode(data) {
  // Never sending raw file data server => client
  return Buffer.from(JSON.stringify(data));
}

/**
 *
 * @param {Buffer} data
 * @return {{ isStream: boolean, data: Buffer | Object}}
 */
function decode(data) {
  const asString = data.toString();
  const isStream = asString.startsWith(KINDS.stream);
  return { isStream, data: isStream ? data.slice(1) : processJsonLike(data, asString) };
}

module.exports = { decode, encode };