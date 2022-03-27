/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */
'use strict';

const fs = require('fs');

class FetchCache {
  constructor(cacheFolder = 'fetch-cache') {
    this.CachePath = `./test/tools/${cacheFolder}/`;
    this.DBPath = this.CachePath + 'database.json';

    import('node-fetch').then(
      ({ default: nodeFetch }) => (this.nodeFetch = nodeFetch)
    );
  }

  static activateAsGlobalFetch() {
    const instance = new FetchCache();

    global.fetch = instance.fetch.bind(instance);
  }

  async fetch(url) {
    let response;

    const fileName = this.convertToFileName(url);

    if (this.isAlreadyCached(fileName)) {
      return this.createResponseObjectUsingCache(fileName, url);
    } else {
      response = await this.nodeFetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
        },
      });

      return {
        url: response.url,
        text: async () => {
          const text = await response.text();

          this.writeToCache(fileName, text, url, response.url);

          return text;
        },
      };
    }
  }

  convertToFileName(url) {
    const filename = url
      .replace(/^https:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\//g, '..')
      .replace(/\?/, '...');

    return filename + (filename.match(/\.css$/) ? '' : '.html');
  }

  isAlreadyCached(fileName) {
    return fs.existsSync(this.CachePath + fileName);
  }

  createResponseObjectUsingCache(fileName, url) {
    const descriptor = JSON.parse(fs.readFileSync(this.DBPath));

    const cachePath = this.CachePath;

    return {
      url: descriptor[url].responseUrl,
      async text() {
        return fs.readFileSync(cachePath + fileName).toString();
      },
    };
  }

  writeToCache(fileName, text, requestUrl, responseUrl) {
    if (!fs.existsSync(this.CachePath)) {
      fs.mkdirSync(this.CachePath);
    }

    fs.writeFileSync(this.CachePath + fileName, text);

    this.updateFileDatabase(fileName, requestUrl, responseUrl);
  }

  updateFileDatabase(fileName, requestUrl, responseUrl) {
    let descriptor = {};

    if (fs.existsSync(this.DBPath)) {
      descriptor = JSON.parse(fs.readFileSync(this.DBPath));
    }

    descriptor[requestUrl] = {
      responseUrl,
      fileName,
    };

    fs.writeFileSync(this.DBPath, JSON.stringify(descriptor));
  }
}

module.exports = FetchCache;
