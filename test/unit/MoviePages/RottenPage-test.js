/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');
const { shouldBeSimilar } = require('./helper');

describe('rottenPage', function () {
  async function fetchFileContent(url) {
    const response = await fetch(url);

    return response.text();
  }

  async function getTestDOM(url) {
    const fileContent = await fetchFileContent(url);

    return new JSDOM(fileContent).window.document;
  }

  async function readMovieDataByRottenPage(url) {
    const text = await fetchFileContent(url);
    const document = new JSDOM(text).window.document;
    const rottenPage = new RottenPage(document, url, text);

    return rottenPage.getMovieInfoWithRatings();
  }

  it('can be instantiated', function () {
    const rottenPage = new RottenPage(
      'input doc',
      'https://www.rottentomatoes.com/m/shawshank_redemption'
    );

    rottenPage._document.should.equal('input doc');
    rottenPage._url.should.equal(
      'https://www.rottentomatoes.com/m/shawshank_redemption'
    );
  });

  describe(`getMovieInfo`, function () {
    it('read all stuff', async function () {
      const url = 'https://www.rottentomatoes.com/m/shawshank_redemption';
      const document = await getTestDOM(url);
      const rottenPage = new RottenPage(document, url);

      const movie = await rottenPage.getMovieInfo();

      movie.should.deep.equal(
        new MovieInfo('The Shawshank Redemption', null, 'Frank Darabont')
      );
    });

    describe(`getMovieInfoWithRatings`, function () {
      context('on a movie with ratings', function () {
        it('read all stuff', async function () {
          const movie = await readMovieDataByRottenPage(
            'https://www.rottentomatoes.com/m/shawshank_redemption'
          );

          const expected = new MovieInfoWithRatings(
            new MovieInfo('The Shawshank Redemption', null, 'Frank Darabont'),
            'https://www.rottentomatoes.com/m/shawshank_redemption',
            RottenPage.NAME,
            null,
            new Summary(
              'Critics Consensus',
              'Steeped in old-fashioned storytelling and given evergreen humanity by Morgan Freeman and Tim Robbins, The Shawshank Redemption chronicles the hardship of incarceration patiently enough to come by its uplift honestly.'
            ),
            new Ratings(89, 141, /certified_fresh.+svg/),
            new Ratings(98, 890259, /aud_score-fresh.+svg/)
          );

          shouldBeSimilar(expected, movie);
        });
      });

      context('on a movie without ratings', function () {
        it('read all stuff', async function () {
          const movie = await readMovieDataByRottenPage(
            'https://www.rottentomatoes.com/m/street_scenes'
          );

          const expected = new MovieInfoWithRatings(
            new MovieInfo('Street Scenes', null, 'Martin Scorsese'),
            'https://www.rottentomatoes.com/m/street_scenes',
            RottenPage.NAME,
            null,
            null,
            null,
            null
          );

          shouldBeSimilar(expected, movie);
        });
      });

      context('on a movie with only audience score', function () {
        it('read all stuff', async function () {
          const movie = await readMovieDataByRottenPage(
            'https://www.rottentomatoes.com/m/amblin'
          );

          const expected = new MovieInfoWithRatings(
            new MovieInfo("Amblin'", null, 'Steven Spielberg'),
            'https://www.rottentomatoes.com/m/amblin',
            RottenPage.NAME,
            null,
            null,
            null,
            new Ratings(60, 309, /aud_score-fresh.+svg/)
          );

          shouldBeSimilar(expected, movie);
        });
      });
    });
  });
});
