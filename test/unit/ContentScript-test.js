/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

describe('Content script', function() {
  describe('injectScores', function() {
    it('inject scores into the document', async function() {
      const dom = await JSDOM
          .fromFile(FakeHtmlPath + 'imdb.title.tt0111161 - listed in top250.html',
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
