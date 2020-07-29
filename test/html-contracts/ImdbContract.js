/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const RealHtmlFetcher = require('./RealHtmlFetcher');

// test runner /////////////////////////////////////////////////////////////////
const types = ['Fake', 'Real'];
const type = types[1];

async function test(type, url, action) {
  const response = await getFetcher(type).fetch(url);
  const text = await response.text();
  const fakeDoc = new JSDOM(text).window.document;
  action(fakeDoc);
}

function getFetcher(type) {
  if (type == 'Fake') {
    return FakeHtmlFetcher;
  } else {
    return RealHtmlFetcher;
  }
}
// test runner /////////////////////////////////////////////////////////////////


describe('ImdbContract', function() {
  context('reading data', function() {
    context('user rating', function() {
      it('is a number', async function() {
        const url = 'https://www.imdb.com/title/tt0111161/';

        await test(type, url, (doc) => {
          const rating = doc.querySelector('span[itemprop="ratingValue"').innerHTML;
          const valueWithoutGroupingCharacters = rating.replace(/,|&nbsp;/g, '');
          isNaN(valueWithoutGroupingCharacters).should.be.false;
        });
      });
    });
  });

  context('Critics rating', function() {
    it('is a number', async function() {
      const url = 'https://www.imdb.com/title/tt0111161/';

      await test(type, url, (doc) => {
        const metacritic = doc
            .querySelector('div.metacriticScore')
            .querySelector('span')
            .innerHTML;
        isNaN(metacritic).should.equal(false);
      });
    });
  });
  // TODO: different languages
});
