/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

let ContentScript;

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

describe('Content script', function() {
  before(function() {
    const {ImdbPage} = require('../../src/MoviePages/ImdbPage');
    global.ImdbPage = ImdbPage;

    global.browser = {runtime: {onMessage: {addListener: () => {}}}};
    const {BackgroundScript} = require('../../src/BackgroundScript');
    global.BackgroundScript = BackgroundScript;

    ({ContentScript} = require('../../src/ContentScript'));
  });

  describe('injectScores', function() {
    it('inject scores into the document', async function() {
      const dom = await JSDOM
          .fromFile('./test/unit/html/imdb.title.tt0111161 - listed in top250.html',
              {url: 'https://www.imdb.com/title/tt0111161/'});
      global.document = dom.window.document;

      global.browser = {runtime:
        {sendMessage: global.BackgroundScript.getRemotePageData},
      };

      await ContentScript.injectScores('RottenTomatoes', 'Imdb');

      document.getElementById('mv-audience-score').should.exist;
      document.getElementById('mv-tomatometer').should.exist;
    });
  });
});
