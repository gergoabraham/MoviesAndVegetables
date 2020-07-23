/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */
'use strict';

function activateFetchFake() {
  global.fetch = fetchFake;
}

async function fetchFake(url) {
  const urlToFilenameTable = generateUrlTableFromFiles();
  const urlWithoutSlashAtEnd = url.replace(/\/$/, '');

  if (urlToFilenameTable[urlWithoutSlashAtEnd]) {
    const filePath = `./test/unit/html/${urlToFilenameTable[urlWithoutSlashAtEnd]}`;
    const fileContent = fs.readFileSync(filePath).toString();

    return {
      url: getDocumentUrl(fileContent, url),
      text: async () => fileContent,
    };
  } else {
    throw new Error(`fetch() fake: no file matches the url.\n\n`+
                    `url: ${url}\n\n` +
                    `filename: ${convertToFileName(url)}`);
  }
}

function generateUrlTableFromFiles() {
  const urlToFilenameTable = {};

  const fileList = fs.readdirSync('./test/unit/html/');

  fileList.forEach((fileName) => {
    const url = fileName
        .replace(/\.\.\./, '?')
        .replace(/\.html/g, '')
        .replace(/\./g, '/')
        .replace(/^([^\/]+)\//, `https://www.$1.com/`)
        .replace(/ .+$/, '');

    urlToFilenameTable[url] = fileName;
  });
  return urlToFilenameTable;
}

function convertToFileName(url) {
  return url.replace(/^https:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\.com/, '')
      .replace(/\//g, '.')
      .replace(/\?/, '...') +

      '.html';
}

function getDocumentUrl(fileContent, originalUrl) {
  const redirectedUrl = fileContent.match(/^---> (.+)$/);

  if (redirectedUrl) {
    return redirectedUrl[1];
  } else {
    return originalUrl;
  }
}

module.exports = {activateFetchFake};
