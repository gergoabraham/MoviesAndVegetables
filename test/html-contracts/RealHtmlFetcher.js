/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */
'use strict';

const nodeFetch = require('node-fetch');


const CachePath = './test/html-contracts/real-htmls-cache/';

class RealHtmlFetcher {
  static async fetch(url) {
    let response;
    const fileName = FakeHtmlFetcher.convertToFileName(url);

    if (fs.existsSync(CachePath + fileName)) {
      return {
        text: async () => {
          return fs.readFileSync(CachePath + fileName).toString();
        },
      };
    } else {
      response = await nodeFetch(url);

      return {text: async () => {
        const text = await response.text();

        if (!fs.existsSync(CachePath)) {
          fs.mkdirSync(CachePath);
        }

        fs.writeFileSync(CachePath + fileName,
            text);

        return text;
      }};
    }
  }

  static get CachePath() {
    return CachePath;
  }
}

module.exports = RealHtmlFetcher;
