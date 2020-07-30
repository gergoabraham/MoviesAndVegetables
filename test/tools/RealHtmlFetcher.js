/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */
'use strict';

const nodeFetch = require('node-fetch');

class RealHtmlFetcher {
  constructor(cacheFolder = 'real-htmls-cache') {
    this.CachePath = `./test/tools/${cacheFolder}/`;
  }

  async fetch(url) {
    let response;
    const fileName = FakeHtmlFetcher.convertToFileName(url);

    if (this.isAlreadyCached(fileName)) {
      return this.createResponseObjectUsingCache(fileName);
    } else {
      response = await nodeFetch(url);

      return {
        text: async ()=> {
          const text = await response.text();
          this.writeToCache(fileName, text);
          return text;
        }};
    }
  }

  isAlreadyCached(fileName) {
    return fs.existsSync(this.CachePath + fileName);
  }

  createResponseObjectUsingCache(fileName) {
    return {
      isBodyAlreadyUsed: false,
      CachePath: this.CachePath,
      // todo: is url needed? let's see in the future
      async text() {
        if (this.isBodyAlreadyUsed) {
          throw new TypeError('body used already');
        } else {
          this.isBodyAlreadyUsed = true;
          return fs.readFileSync(this.CachePath + fileName).toString();
        }
      },
    };
  }

  writeToCache(fileName, text) {
    if (!fs.existsSync(this.CachePath)) {
      fs.mkdirSync(this.CachePath);
    }

    fs.writeFileSync(this.CachePath + fileName, text);
  }
}

module.exports = RealHtmlFetcher;
