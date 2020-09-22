/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');

describe('rottenPage', function () {
  async function getTestDocument(
    filename = 'rottentomatoes.m.shawshank_redemption.html'
  ) {
    const dom = await JSDOM.fromFile(FakeHtmlPath + filename);
    return dom.window.document;
  }

  it('can be instantiated', function () {
    const rottenPage = new RottenPage(
      'input doc',
      'https://www.rottentomatoes.com/m/shawshank_redemption#contentReviews'
    );

    rottenPage.document.should.equal('input doc');
    rottenPage.url.should.equal(
      'https://www.rottentomatoes.com/m/shawshank_redemption'
    );
  });

  describe(`getMovieData`, function () {
    context('on a movie with ratings', function () {
      let movieData;

      before(async function () {
        const document = await getTestDocument();
        const rottenPage = new RottenPage(
          document,
          'https://www.rottentomatoes.com/m/shawshank_redemption#contentReviews'
        );
        movieData = await rottenPage.getMovieData();
      });

      it(`read the title`, function () {
        movieData.should.contain({ title: 'The Shawshank Redemption' });
      });

      it(`read the release year`, function () {
        movieData.should.contain({ year: 1994 });
      });

      it(`read the url of the page`, function () {
        movieData.should.contain({
          url: 'https://www.rottentomatoes.com/m/shawshank_redemption',
        });
      });

      it('read the user rating', function () {
        movieData.should.contain({ userRating: 98 });
      });

      it(`read the number of users' votes`, function () {
        movieData.should.contain({ numberOfUserVotes: 885688 });
      });

      it('read the critics rating', function () {
        movieData.should.contain({ criticsRating: 90 });
      });

      it(`read the number of critics' votes`, function () {
        movieData.should.contain({ numberOfCriticsVotes: 71 });
      });

      it('not read toplistPosition', function () {
        movieData.should.contain({ toplistPosition: null });
      });
    });

    context('on a movie without ratings', function () {
      let movieData;

      before(`let's check some unimportant data`, async function () {
        const document = await getTestDocument(
          'rottentomatoes.m.avatar_5 - no ratings yet.html'
        );
        const rottenPage = new RottenPage(
          document,
          'https://www.rottentomatoes.com/m/avatar_5'
        );
        movieData = await rottenPage.getMovieData();

        movieData.should.contain({ title: 'Avatar 5' });
        movieData.should.contain({ year: 2028 });
        movieData.should.contain({
          url: 'https://www.rottentomatoes.com/m/avatar_5',
        });
      });

      it('read the user rating', function () {
        movieData.should.contain({ userRating: null });
      });

      it(`read the number of users' votes`, function () {
        movieData.should.contain({ numberOfUserVotes: null });
      });

      it('read the critics rating', function () {
        movieData.should.contain({ criticsRating: null });
      });

      it(`read the number of critics' votes`, function () {
        movieData.should.contain({ numberOfCriticsVotes: null });
      });

      it('not read toplistPosition', function () {
        movieData.should.contain({ toplistPosition: null });
      });
    });

    context('on a movie with only audience score', function () {
      let movieData;

      before(`let's check some unimportant data`, async function () {
        const document = await getTestDocument(
          'rottentomatoes.m.amblin - only audience score.html'
        );
        const rottenPage = new RottenPage(
          document,
          'https://www.rottentomatoes.com/m/amblin'
        );
        movieData = await rottenPage.getMovieData();

        movieData.should.contain({ title: "Amblin'" });
        movieData.should.contain({ year: 1968 });
        movieData.should.contain({
          url: 'https://www.rottentomatoes.com/m/amblin',
        });
      });

      it('read the user rating', function () {
        movieData.should.contain({ userRating: 60 });
      });

      it(`read the number of users' votes`, function () {
        movieData.should.contain({ numberOfUserVotes: 309 });
      });

      it('read the critics rating', function () {
        movieData.should.contain({ criticsRating: null });
      });

      it(`read the number of critics' votes`, function () {
        movieData.should.contain({ numberOfCriticsVotes: null });
      });

      it('not read toplistPosition', function () {
        movieData.should.contain({ toplistPosition: null });
      });
    });
  });

  describe('injectRatings', function () {
    context('no toplist position', function () {
      let document;

      before(async function () {
        document = await getTestDocument();

        const rottenPage = new RottenPage(
          document,
          'https://www.rottentomatoes.com/m/shawshank_redemption#contentReviews'
        );

        rottenPage.injectRatings(
          new MovieData(
            'The Shawshank Redemption',
            1994,
            'https://www.imdb.com/title/tt0111161/',
            9,
            2181618,
            80,
            20,
            null
          )
        );
      });

      it('fix Tomatometer and Audience score alignment (via width)', function () {
        const ratingsContainers = document.querySelectorAll(
          'div.mop-ratings-wrap__half'
        );

        ratingsContainers[0]
          .getAttribute('style')
          .should.equal('min-width:240px');
        ratingsContainers[1]
          .getAttribute('style')
          .should.equal('min-width:240px');
      });

      it('add IMDb scoreboard container', function () {
        const scoreboardContainers = document.querySelectorAll(
          'section.mop-ratings-wrap__row.js-scoreboard-container'
        );

        scoreboardContainers.length.should.equal(2);
        scoreboardContainers[1]
          .getAttribute('id')
          .should.equal('mv-imdb-scores');
      });

      it('insert the scores with correct data and format', function () {
        const IMDbScores = document.getElementById('mv-imdb-scores');

        IMDbScores.outerHTML.should.equal(
          `<section id="mv-imdb-scores" class="mop-ratings-wrap__row js-scoreboard-container" ` +
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
            `</section>`
        );
      });
    });

    context('toplist position', function () {
      let document;

      before(async function () {
        document = await getTestDocument();

        const rottenPage = new RottenPage(
          document,
          'https://www.rottentomatoes.com/m/shawshank_redemption#contentReviews'
        );

        rottenPage.injectRatings(
          new MovieData(
            'The Shawshank Redemption',
            1994,
            'https://www.imdb.com/title/tt0111161/',
            9,
            2181618,
            80,
            20,
            33
          )
        );
      });

      it('insert toplist position', function () {
        document
          .getElementById('mv-imdb-scores')
          .querySelectorAll(
            `h3.mop-ratings-wrap__title.audience-score__title.mop-ratings-wrap__title--small`
          )[0]
          .textContent.should.equal('IMDb rating #33/250');
      });
    });
  });
});
