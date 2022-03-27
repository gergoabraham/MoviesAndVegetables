/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');

describe('Content script', function () {
  describe('injectScores', function () {
    it('inject scores into the document', async function () {
      const response = await fetch('https://www.imdb.com/title/tt0111161/');
      const text = await response.text();
      const dom = new JSDOM(text);

      global.document = dom.window.document;

      await ContentScript.injectRatings(RottenPage.NAME, ImdbPage.NAME);

      document.getElementById('mv-audience-score').should.exist;
      document.getElementById('mv-tomatometer').should.exist;
    });
  });
});
