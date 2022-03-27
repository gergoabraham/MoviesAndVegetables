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
      const response = await fetch('https://www.imdb.com/title/tt0111161/');
      const text = await response.text();
      const dom = new JSDOM(text);

      global.document = dom.window.document;

      await ContentScriptImdb.injectRottenTomatoesRatings();

      const audienceScore = document.getElementById('mv-audience-score');
      const tomatoMeter = document.getElementById('mv-tomatometer');

      audienceScore.should.exist;
      audienceScore.querySelector('span').textContent.should.match(/\d\d%/);

      tomatoMeter.should.exist;
      tomatoMeter.querySelector('span').textContent.should.match(/\d\d%/);
    });
  });
});
