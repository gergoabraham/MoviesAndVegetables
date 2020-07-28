/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */
'use strict';

class FakeHtmlFetcher {
  static activateAsGlobalFetch() {
    global.fetch = FakeHtmlFetcher.fetch;
  }

  static async fetch(url) {
    let isBodyAlreadyUsed = false;
    const urlToFilenameTable = FakeHtmlFetcher.generateUrlTableFromFiles();
    const urlWithoutSlashAtEnd = url.replace(/\/$/, '');

    if (urlToFilenameTable[urlWithoutSlashAtEnd]) {
      const filePath = FakeHtmlPath + urlToFilenameTable[urlWithoutSlashAtEnd];
      const fileContent = fs.readFileSync(filePath).toString();

      return {
        url: FakeHtmlFetcher.getDocumentUrl(fileContent, url),
        text: async () => {
          if (isBodyAlreadyUsed) {
            throw new TypeError('body used already');
          } else {
            isBodyAlreadyUsed = true;
            return fileContent;
          }
        },
      };
    } else {
      throw new Error(`fetch() fake: no file matches the url.\n\n`+
                    `url: ${url}\n\n` +
                    `filename: ${FakeHtmlFetcher.convertToFileName(url)}`);
    }
  }

  static generateUrlTableFromFiles() {
    const urlToFilenameTable = {};

    const fileList = fs.readdirSync(FakeHtmlPath);

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

  static convertToFileName(url) {
    return url.replace(/^https:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\.com/, '')
        .replace(/\//g, '.')
        .replace(/\?/, '...') +

      '.html';
  }

  static getDocumentUrl(fileContent, originalUrl) {
    const redirectedUrl = fileContent.match(/^---> (.+)$/);

    if (redirectedUrl) {
      return redirectedUrl[1];
    } else {
      return originalUrl;
    }
  }
}

module.exports = FakeHtmlFetcher;
