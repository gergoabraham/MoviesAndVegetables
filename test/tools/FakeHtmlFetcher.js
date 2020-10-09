/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */
'use strict';

const fs = require('fs');

class FakeHtmlFetcher {
  /**
   * Register the fake `fetch()` function as the global `fetch()`.
   */
  static activateAsGlobalFetch() {
    global.fetch = FakeHtmlFetcher.fetch;
  }

  static async fetch(url) {
    const urlToFilenameTable = FakeHtmlFetcher.generateUrlTableFromFiles();
    const urlWithoutSlashAtEnd = url.replace(/\/$/, '');

    if (urlToFilenameTable[urlWithoutSlashAtEnd]) {
      const filePath = FakeHtmlPath + urlToFilenameTable[urlWithoutSlashAtEnd];
      const fileContent = fs.readFileSync(filePath).toString();

      return {
        isBodyAlreadyUsed: false,
        url: FakeHtmlFetcher.getDocumentUrl(fileContent, url),
        async text() {
          if (this.isBodyAlreadyUsed) {
            throw new TypeError('body used already');
          } else {
            this.isBodyAlreadyUsed = true;
            return fileContent;
          }
        },
      };
    } else {
      throw new Error(
        `fetch() fake: no file matches the url.\n\n` +
          `url: ${url}\n\n` +
          `filename: ${FakeHtmlFetcher.convertToFileName(url)}`
      );
    }
  }

  static generateUrlTableFromFiles() {
    const urlToFilenameTable = {};

    const fileList = fs.readdirSync(FakeHtmlPath);

    fileList.forEach((fileName) => {
      const url = fileName
        .replace(/\.\.\./, '?')
        .replace(/\.html/g, '')
        .replace(/\.(?!\w{3,4}$)/g, '/') // dots that are not before a file extension
        .replace(/^([^/]+)\//, `https://www.$1.com/`)
        .replace(/ .+$/, '');

      urlToFilenameTable[url] = fileName;
    });
    return urlToFilenameTable;
  }

  static convertToFileName(url) {
    const filename = url
      .replace(/^https:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\.com/, '')
      .replace(/\//g, '.')
      .replace(/\?/, '...');

    return filename + (filename.match(/\.\w{3,4}$/) ? '' : '.html');
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
