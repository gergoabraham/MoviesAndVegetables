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
    it('should read Tomatometer from Rotten page', function() {
      readRottenData(document, 'movieUrl')
          .should.contain({tomatoMeter: '91'});
    });

    it('should read AudienceScore from Rotten page', function() {
      readRottenData(document, 'movieUrl')
          .should.contain({audienceScore: '98'});
    });
  });
});
