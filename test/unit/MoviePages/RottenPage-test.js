/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');

describe('rottenPage', function () {
  async function getTestDOM(url) {
    const response = await fetch(url);
    const fileContent = await response.text();

    return new JSDOM(fileContent).window.document;
  }

  async function readMovieDataByRottenPage(url) {
    const document = await getTestDOM(url);
    const rottenPage = new RottenPage(document, url);

    return rottenPage.getMovieData();
  }

  it('can be instantiated', function () {
    const rottenPage = new RottenPage(
      'input doc',
      'https://www.rottentomatoes.com/m/shawshank_redemption'
    );

    rottenPage.document.should.equal('input doc');
    rottenPage.url.should.equal(
      'https://www.rottentomatoes.com/m/shawshank_redemption'
    );
  });

  describe(`getMovieData`, function () {
    context('on a movie with ratings', function () {
      it('read all stuff', async function () {
        const movie = await readMovieDataByRottenPage(
          'https://www.rottentomatoes.com/m/shawshank_redemption'
        );

        movie.should.deep.equal(
          new Movie(
            { title: 'The Shawshank Redemption', year: 1994 },
            'https://www.rottentomatoes.com/m/shawshank_redemption',
            null,
            {
              score: 90,
              count: 71,
              custom:
                'https://www.rottentomatoes.com/assets/certified_fresh.svg',
            },
            {
              score: 98,
              count: 885688,
              custom:
                'https://www.rottentomatoes.com/assets/aud_score-fresh.svg',
            }
          )
        );
      });
    });

    context('on a movie without ratings', function () {
      it('read all stuff', async function () {
        const movie = await readMovieDataByRottenPage(
          'https://www.rottentomatoes.com/m/avatar_5'
        );

        movie.should.deep.equal(
          new Movie(
            { title: 'Avatar 5', year: 2028 },
            'https://www.rottentomatoes.com/m/avatar_5',
            null,
            null,
            null
          )
        );
      });
    });

    context('on a movie with only audience score', function () {
      it('read all stuff', async function () {
        const movie = await readMovieDataByRottenPage(
          'https://www.rottentomatoes.com/m/amblin'
        );

        movie.should.deep.equal(
          new Movie(
            { title: "Amblin'", year: 1968 },
            'https://www.rottentomatoes.com/m/amblin',
            null,
            null,
            {
              score: 60,
              count: 309,
              custom:
                'https://www.rottentomatoes.com/assets/aud_score-fresh.svg',
            }
          )
        );
      });
    });
  });

  describe('injectRatings', function () {
    context('all scores are present', function () {
      let document;

      before(async function () {
        const url = 'https://www.rottentomatoes.com/m/shawshank_redemption';
        document = await getTestDOM(url);
        const rottenPage = new RottenPage(document, url);

        rottenPage.injectRatings(
          new Movie(
            { title: 'The Shawshank Redemption', year: 1994 },
            'https://www.imdb.com/title/tt0111161/',
            null,
            {
              score: 80,
              count: 20,
              custom: '#66ffee',
            },
            {
              score: 9,
              count: 2181618,
              custom: '<svg id="home_img">This is the logo.</svg>',
            }
          )
        );
      });

      it('fix Tomatometer and Audience score alignment (via width)', function () {
        const ratingsContainers = document.querySelectorAll(
          'div.mop-ratings-wrap__half'
        );

        ratingsContainers[0].style.flexBasis.should.equal('100%');
        ratingsContainers[1].style.flexBasis.should.equal('100%');
      });

      it('add IMDb scoreboard container', function () {
        const scoreboardContainers = document.querySelectorAll(
          'section.mop-ratings-wrap__row.js-scoreboard-container'
        );

        scoreboardContainers.length.should.equal(2);
        scoreboardContainers[1].id.should.equal('mv-imdb-scores');
      });

      it('insert the scores with correct data and format', function () {
        const IMDbScores = document.getElementById('mv-imdb-scores');

        IMDbScores.outerHTML.should.equal(
          `<section id="mv-imdb-scores" class="mop-ratings-wrap__row js-scoreboard-container"` +
            ` style="border-top:2px solid #2a2c32;margin-top:30px;padding-top:20px">` +
            `  <div class="mop-ratings-wrap__half" style="flex-basis: 100%">` +
            `    <a href="https://www.imdb.com/title/tt0111161/criticreviews" class="unstyled articleLink" title="Open The Shawshank Redemption Critic Reviews on IMDb">` +
            `      <h2 class="mop-ratings-wrap__score">` +
            `        <span class="mop-ratings-wrap__percentage" style="background-color: #66ffee; padding: 0px 8px;">80</span></h2>` +
            `    <div class="mop-ratings-wrap__review-totals">` +
            `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
            `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
            `      <small class="mop-ratings-wrap__text--small">20</small>` +
            `    </div>` +
            `  </a>` +
            `</div>` +
            `  <div class="mop-ratings-wrap__half audience-score" style="flex-basis: 100%">` +
            `    <a href="https://www.imdb.com/title/tt0111161/" class="unstyled articleLink" title="Open The Shawshank Redemption on IMDb">` +
            `    <h2 class="mop-ratings-wrap__score">` +
            `<svg id="home_img" style="vertical-align: middle;">This is the logo.</svg>` +
            `        <span class="mop-ratings-wrap__percentage" style="vertical-align: middle;">9.0</span>` +
            `    </h2>` +
            `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released">` +
            `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating</h3>` +
            `      <strong class="mop-ratings-wrap__text--small">User Ratings: 2,181,618</strong>` +
            `    </div>` +
            `      </a>` +
            `</div>` +
            `</section>`
        );
      });
    });

    context('no ratings yet', function () {
      let document;

      before(async function () {
        const url = 'https://www.rottentomatoes.com/m/shawshank_redemption';
        document = await getTestDOM(url);
        const rottenPage = new RottenPage(document, url);

        rottenPage.injectRatings(
          new Movie(
            { title: 'The Shawshank Redemption', year: 1994 },
            'https://www.imdb.com/title/tt0111161/',
            null,
            null,
            null
          )
        );
      });

      it('no critic ratings', function () {
        document
          .getElementById('mv-imdb-scores')
          .getElementsByClassName('mop-ratings-wrap__half')[0]
          .innerHTML.should.equal(
            `    <a href="https://www.imdb.com/title/tt0111161/criticreviews" class="unstyled articleLink" title="Open The Shawshank Redemption Critic Reviews on IMDb">` +
              `        <div class="mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion"` +
              `>There are no<br>Metacritic reviews</div>    ` +
              `<div class="mop-ratings-wrap__review-totals">` +
              `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
              `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
              `      <small class="mop-ratings-wrap__text--small">N/A</small>` +
              `    </div></a>`
          );
      });

      it('no user score', function () {
        document
          .getElementById('mv-imdb-scores')
          .getElementsByClassName('mop-ratings-wrap__half')[1]
          .innerHTML.should.equal(
            `    <a href="https://www.imdb.com/title/tt0111161/" class="unstyled articleLink" title="Open The Shawshank Redemption on IMDb">` +
              `  <div class="audience-score__italics mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion mop-ratings-wrap__text--not-released">` +
              `        <p class="mop-ratings-wrap__prerelease-text">Coming soon</p>` +
              `    </div>` +
              `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released">` +
              `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating</h3>` +
              `      <strong class="mop-ratings-wrap__text--small">User Ratings: N/A</strong>` +
              `    </div>` +
              `      </a>`
          );
      });
    });

    context('toplist position', function () {
      let document;

      before(async function () {
        const url = 'https://www.rottentomatoes.com/m/shawshank_redemption';
        document = await getTestDOM(url);
        const rottenPage = new RottenPage(document, url);

        rottenPage.injectRatings(
          new Movie(
            { title: 'The Shawshank Redemption', year: 1994 },
            'https://www.imdb.com/title/tt0111161/',
            33,
            {
              score: 80,
              count: 20,
              custom: '#66ffee',
            },
            {
              score: 9,
              count: 2181618,
              custom: '<svg id="home_img">This is the logo.</svg>',
            }
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
