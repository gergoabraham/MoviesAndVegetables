/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');

describe('Content script on RottenTomatoes', function () {
  describe('injectImdbScoresOnRotten', function () {
    it('inject IMDb scores into the document', async function () {
      const dom = await JSDOM.fromFile(
        FakeHtmlPath + 'rottentomatoes.com..m..shawshank_redemption.html',
        { url: 'https://www.rottentomatoes.com/m/shawshank_redemption' }
      );

      global.document = dom.window.document;

      await ContentScriptRottenTomatoes.injectImdbRatings();

      const imdbScores = document.getElementById('mv-imdb-scores');

      imdbScores.should.exist;

      const scoreValues = imdbScores.querySelectorAll('span');

      scoreValues[0].textContent.should.equal('80');
      scoreValues[1].textContent.should.equal('9.3');
    });
  });
});
