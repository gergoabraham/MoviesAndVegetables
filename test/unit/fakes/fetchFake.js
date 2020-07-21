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
  const fileName = convertToFileName(url);
  const filePath = `./test/unit/html/${fileName}`;

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath).toString();

    return {
      url: getDocumentUrl(fileContent, url),
      text: async () => fileContent,
    };
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
