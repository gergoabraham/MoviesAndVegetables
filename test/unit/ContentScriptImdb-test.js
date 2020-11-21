/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');

describe('Content script on IMDb', function () {
  describe('injectRottenScoresOnImdb', function () {
    it('inject RottenTomatoes scores into the document', async function () {
      const dom = await JSDOM.fromFile(
        FakeHtmlPath + 'imdb.title.tt0111161 - listed in top250.html',
        { url: 'https://www.imdb.com/title/tt0111161/' }
      );

      global.document = dom.window.document;

      await ContentScriptImdb.injectRottenTomatoesRatings();

      const audienceScore = document.getElementById('mv-audience-score');
      const tomatoMeter = document.getElementById('mv-tomatometer');

      audienceScore.should.exist;
      audienceScore.querySelector('span').textContent.should.equal('98%');

      tomatoMeter.should.exist;
      tomatoMeter.querySelector('span').textContent.should.equal('90%');
    });
  });
});
