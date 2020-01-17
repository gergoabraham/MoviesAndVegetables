/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const {MoviePage} = require('../../src/MoviePages/MoviePage');
global.MoviePage = MoviePage;
const {RottenPage} = require('../../src/MoviePages/RottenPage');

describe('rottenPage', function() {
  let document;

  before(async function() {
    const dom = await JSDOM.fromFile('./test/html/testRottenTomatoesPage.html');
    document = dom.window.document;
  });

  it('can be instantiated', function() {
    const rottenPage = new RottenPage('input doc');
    rottenPage.document.should.equal('input doc');
  });

  describe(`getMovieData`, function() {
    let rottenPage;

    before(function() {
      rottenPage = new RottenPage(document);
    });

    it('should read Tomatometer', function() {
      rottenPage.getMovieData()
          .should.contain({tomatoMeter: '91'});
    });

    it('should read AudienceScore', function() {
      rottenPage.getMovieData()
          .should.contain({audienceScore: '98'});
    });

    it('should read number of votes on TomatoMeter', function() {
      rottenPage.getMovieData()
          .should.contain({tomatoMeterCount: '68'});
    });

    it('should read number of votes on AudienceScore', function() {
      rottenPage.getMovieData()
          .should.contain({audienceScoreCount: '885203'});
    });
  });
});
