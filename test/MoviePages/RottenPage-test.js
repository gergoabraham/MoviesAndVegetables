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

    it('should not read toplistPosition', function() {
      movieData.should.contain({toplistPosition: -1});
    });
  });

  describe('injectRatings', function() {
    let document;
    let rottenPage;
    context('no toplist position', function() {
      before(async function() {
        const dom = await JSDOM.fromFile('./test/html/testRottenTomatoesPage.html');
        document = dom.window.document;

        rottenPage = new RottenPage(document,
            'https://www.rottentomatoes.com/m/shawshank_redemption#contentReviews');

        rottenPage.injectRatings(new MovieData(
            'The Shawshank Redemption', 1994,
            'https://www.imdb.com/title/tt0111161/',
            9, 2181618,
            80, 20,
            -1),
        );
      });

      it('should fix Tomatometer and Audience score alignment (via width)', function() {
        const ratingsContainers = document
            .querySelectorAll('div.mop-ratings-wrap__half');

        ratingsContainers[0].getAttribute('style')
            .should.equal('min-width:240px');
        ratingsContainers[1].getAttribute('style')
            .should.equal('min-width:240px');
      });

      it('should add IMDb scoreboard container', function() {
        const scoreboardContainers = document
            .querySelectorAll(
                'section.mop-ratings-wrap__row.js-scoreboard-container');

        scoreboardContainers.length.should.equal(2);
        scoreboardContainers[1].getAttribute('id')
            .should.equal('IMDb scores');
      });

      it('should insert the scores with correct data and format', function() {
        const IMDbScores = document.getElementById('IMDb scores');

        IMDbScores.outerHTML.should.equal(
            `<section id="IMDb scores" class="mop-ratings-wrap__row js-scoreboard-container" ` +
            `style="border-top:2px solid #2a2c32;margin-top:20px">` +
            `<div class="mop-ratings-wrap__half" style="min-width:240px">` +
              `<h2 class="mop-ratings-wrap__score">` +
              `<a href="https://www.imdb.com/title/tt0111161/criticreviews" class="unstyled articleLink">` +
                `<span class="mop-ratings-wrap__percentage" title="Open Critic Reviews on IMDb">80</span></a></h2>` +
              `<div class="mop-ratings-wrap__review-totals" style="margin-top:0px">` +
              `<h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
              `<strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
              `<small class="mop-ratings-wrap__text--small">20</small>` +
              `</div>` +
            `</div>` +
            `<div class="mop-ratings-wrap__half audience-score" style="min-width:240px">` +
              `<h2 class="mop-ratings-wrap__score">` +
              `<a href="https://www.imdb.com/title/tt0111161/" class="unstyled articleLink">` +
                `<span class="mop-ratings-wrap__percentage" title="Open The Shawshank Redemption on IMDb">9.0</span>` +
              `</a>` +
              `</h2>` +
              `<div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released" ` +
              `style="margin-top:0px">` +
              `<h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating</h3>` +
              `<strong class="mop-ratings-wrap__text--small">Number of votes: 2,181,618</strong>` +
              `</div>` +
            `</div>` +
          `</section>`,
        );
      });
    });

    context('toplist position', function() {
      before(async function() {
        const dom = await JSDOM.fromFile('./test/html/testRottenTomatoesPage.html');
        document = dom.window.document;

        rottenPage = new RottenPage(document,
            'https://www.rottentomatoes.com/m/shawshank_redemption#contentReviews');

        rottenPage.injectRatings(new MovieData(
            'The Shawshank Redemption', 1994,
            'https://www.imdb.com/title/tt0111161/',
            9, 2181618,
            80, 20,
            33),
        );
      });

      it('should insert toplist position', function() {
        document.getElementById('IMDb scores')
            .querySelectorAll(`h3.mop-ratings-wrap__title.audience-score__title.mop-ratings-wrap__title--small`)[0]
            .textContent
            .should.equal('IMDb rating #33/250');
      });
    });
  });
});
