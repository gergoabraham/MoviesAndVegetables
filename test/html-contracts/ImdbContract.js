/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const contract = require('../tools/ContractTestDescription');


contract('ImdbContract', function(fetchDOM) {
  context('reading data', function() {
    context('user rating', function() {
      it('is a number', async function() {
        const document = await fetchDOM('https://www.imdb.com/title/tt0111161/');

        const rating = document
            .querySelector('span[itemprop="ratingValue"').innerHTML;
        const valueWithoutGroupingCharacters = rating.replace(/,|&nbsp;/g, '');
        isNaN(valueWithoutGroupingCharacters).should.be.false;
      });
    });
  });

  context('Critics rating', function() {
    it('is a number', async function() {
      const document = await fetchDOM('https://www.imdb.com/title/tt0111161/');

      const metacritic = document
          .querySelector('div.metacriticScore')
          .querySelector('span')
          .innerHTML;
      isNaN(metacritic).should.equal(false);
    });
  });
  // TODO: different languages
});
