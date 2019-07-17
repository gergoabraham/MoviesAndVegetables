'use strict';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

// Functions under test
require('../src/rottenPage');
const {readRottenData} = window;

describe('rottenPage', function() {
  let document;

  before(async function() {
    const dom = await JSDOM.fromFile('./test/testRottenTomatoesPage.html');
    document = dom.window.document;
  });

  describe(`readRottenData`, function() {
    it('should read movie scores from Rotten page', function() {
      readRottenData(document, 'movieUrl')
          .should.deep.equal(
              {
                tomatoMeter: '91',
                audienceScore: '98',
                url: `movieUrl`,
              }
          );
    });
  });
});
