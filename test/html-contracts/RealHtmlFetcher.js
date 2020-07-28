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

    if (fs.existsSync(CachePath + 'google.html')) {
      return {
        text: async () => {
          return fs.readFileSync(CachePath + 'google.html').toString();
        },
      };
    } else {
      response = await nodeFetch(url);

      return {text: async () => {
        const text = await response.text();

        if (!fs.existsSync(CachePath)) {
          fs.mkdirSync(CachePath);
        }

        fs.writeFileSync(CachePath + 'google.html',
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
