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
  const filePath = `./test/unit/html/${convertToFileName(url)}.html`;

  if (fs.existsSync(filePath)) {
    return {text: async () => fs.readFileSync(filePath).toString()};
  } else {
    throw new Error(`fetch() fake: no file matches this url: ${url}`);
  }
}

function convertToFileName(url) {
  return url.replace(/^https:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\.com/, '')
      .replace(/\//g, '.');
}

module.exports = {activateFetchFake};
