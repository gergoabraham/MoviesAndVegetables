/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */
'use strict';

function activateFetchFake(url) {
  global.fetch = fetchFake;
}

async function fetchFake(url) {
  const fileName = `${convertToFileName(url)}.html`;
  const filePath = `./test/unit/html/${fileName}`;

  if (fs.existsSync(filePath)) {
    return {text: async () => fs.readFileSync(filePath).toString()};
  } else {
    throw new Error(`fetch() fake: no file matches the url.\n\n`+
    `url: ${url}\n\n` +
    `filename: ${fileName}`);
  }
}

function convertToFileName(url) {
  return url.replace(/^https:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\.com/, '')
      .replace(/\//g, '.');
}

module.exports = {activateFetchFake};
