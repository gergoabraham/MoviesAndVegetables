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
    const rottenPage = new RottenPage('input doc',
        'https://www.rottentomatoes.com/m/shawshank_redemption#contentReviews');

    rottenPage.document.should.equal('input doc');
    rottenPage.url.should.equal(
        'https://www.rottentomatoes.com/m/shawshank_redemption');
  });

  describe(`getMovieData`, function() {
    let rottenPage;
    let movieData;

    before(async function() {
      rottenPage = new RottenPage(document,
          'https://www.rottentomatoes.com/m/shawshank_redemption#contentReviews');
      movieData = await rottenPage.getMovieData();
    });

    it(`should read the title`, function() {
      movieData.should.contain({title: 'The Shawshank Redemption'});
    });

    it(`should read the release year`, function() {
      movieData.should.contain({year: 1994});
    });

    it(`should read the url of the page`, function() {
      movieData.should.contain(
          {url: 'https://www.rottentomatoes.com/m/shawshank_redemption'});
    });

    it('should read the user rating', function() {
      movieData.should.contain({userRating: 98});
    });

    it(`should read the number of users' votes`, function() {
      movieData.should.contain({numberOfUserVotes: 885688});
    });

    it('should read the critics rating', function() {
      movieData.should.contain({criticsRating: 90});
    });

    it(`should read the number of critics' votes`, function() {
      movieData.should.contain({numberOfCriticsVotes: 71});
    });
  });
});
