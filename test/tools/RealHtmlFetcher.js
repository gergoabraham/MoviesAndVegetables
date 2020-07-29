/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */
'use strict';

const nodeFetch = require('node-fetch');


const CachePath = './test/tools/real-htmls-cache/';

class RealHtmlFetcher {
  static async fetch(url) {
    let response;
    const fileName = FakeHtmlFetcher.convertToFileName(url);

    if (RealHtmlFetcher.isAlreadyCached(fileName)) {
      return RealHtmlFetcher.createResponseObjectUsingCache(fileName);
    } else {
      response = await nodeFetch(url);

      return {
        async text() {
          const text = await response.text();
          RealHtmlFetcher.writeToCache(fileName, text);
          return text;
        }};
    }
  }

  static isAlreadyCached(fileName) {
    return fs.existsSync(CachePath + fileName);
  }

  static createResponseObjectUsingCache(fileName) {
    return {
      isBodyAlreadyUsed: false,
      // todo: is url needed? let's see in the future
      async text() {
        if (this.isBodyAlreadyUsed) {
          throw new TypeError('body used already');
        } else {
          this.isBodyAlreadyUsed = true;
          return fs.readFileSync(CachePath + fileName).toString();
        }
      },
    };
  }

  static writeToCache(fileName, text) {
    if (!fs.existsSync(CachePath)) {
      fs.mkdirSync(CachePath);
    }

    fs.writeFileSync(CachePath + fileName, text);
  }

  static get CachePath() {
    return CachePath;
  }
}

module.exports = RealHtmlFetcher;
