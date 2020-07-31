/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const {JSDOM} = require('jsdom');


describe('Content script on RottenTomatoes', function() {
  describe('injectImdbScoresOnRotten', function() {
    it('inject IMDb scores into the document', async function() {
      const dom = await JSDOM
          .fromFile(FakeHtmlPath + 'rottentomatoes.m.shawshank_redemption.html',
              {url: 'https://www.rottentomatoes.com/m/shawshank_redemption'});
      global.document = dom.window.document;

      await ContentScriptRottenTomatoes.injectImdbScores();

      document.getElementById('mv-imdb-scores').should.exist;
    });
  });
});
