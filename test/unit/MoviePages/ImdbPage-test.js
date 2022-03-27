/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');
const sinon = require('sinon');

describe('ImdbPage', function () {
  async function getTestDOM(url) {
    const response = await fetch(url);
    const fileContent = await response.text();

    return new JSDOM(fileContent).window.document;
  }

  async function readMovieDataByImdbPage(url) {
    const document = await getTestDOM(url);
    const imdbPage = new ImdbPage(document, url);

    return imdbPage.getMovieInfoWithRatings();
  }

  it('can be instantiated', function () {
    const imdbPage = new ImdbPage(
      'input doc',
      `https://www.imdb.com/title/tt0111161/?pf_rd_t=15506&pf_rd_i=top`
    );

    imdbPage._document.should.equal('input doc');
    imdbPage._url.should.equal(`https://www.imdb.com/title/tt0111161/`);
  });

  describe('getMovieInfo', function () {
    it('read the basic stuff', async function () {
      const url = 'https://www.imdb.com/title/tt0111161/';
      const document = await getTestDOM(url);
      const imdbPage = new ImdbPage(document, url);

      const movie = await imdbPage.getMovieInfo();

      movie.should.deep.equal(
        new MovieInfo('The Shawshank Redemption', 1994, 'Frank Darabont')
      );
    });
  });

  describe.skip('getMovieInfoWithRatings', function () {
    context(`on a movie with ratings`, function () {
      it('read all stuff', async function () {
        const movie = await readMovieDataByImdbPage(
          'https://www.imdb.com/title/tt0111161/'
        );

        movie.should.deep.equal(
          new MovieInfoWithRatings(
            new MovieInfo('The Shawshank Redemption', 1994, 'Frank Darabont'),
            'https://www.imdb.com/title/tt0111161/',
            ImdbPage.NAME,
            1,
            new Summary('Summary', 'Two imprisoned men having problems.'),
            new Ratings(80, 20, '#66Cc33'),
            new Ratings(
              9.3,
              2260000,
              '<svg id="home_img">This is the logo.</svg>'
            )
          )
        );
      });
    });

    context(`on a movie without ratings`, function () {
      it('read all stuff', async function () {
        const movie = await readMovieDataByImdbPage(
          'https://www.imdb.com/title/tt1630029/'
        );

        movie.should.deep.equal(
          new MovieInfoWithRatings(
            new MovieInfo('Avatar 2', 2022, null),
            'https://www.imdb.com/title/tt1630029/',
            ImdbPage.NAME,
            null,
            null,
            null,
            null
          )
        );
      });
    });

    context(`on a not top250 movie's imdb page`, function () {
      it('toplistPosition is null', async function () {
        const movie = await readMovieDataByImdbPage(
          'https://www.imdb.com/title/tt1630029/'
        );

        movie.should.contain({ toplistPosition: null });
      });
    });

    context.skip(`on a series' imdb page`, function () {
      it('reject (for now, TODO)', async function () {
        const url = 'https://www.imdb.com/title/tt0149460/';
        const document = await getTestDOM(url);
        const imdbPage = new ImdbPage(document, url);

        await imdbPage
          .getMovieInfoWithRatings()
          .should.be.rejectedWith(Error, 'Not a movie');
      });
    });

    context(`on a movie with missing css`, function () {
      it('read all stuff', async function () {
        const movie = await readMovieDataByImdbPage(
          'https://www.imdb.com/title/tt0111162/'
        );

        movie.should.deep.equal(
          new MovieInfoWithRatings(
            new MovieInfo('The Shawshank Redemption', 1994, null),
            'https://www.imdb.com/title/tt0111162/',
            ImdbPage.NAME,
            1,
            new Summary('Summary', 'Two imprisoned men having problems.'),
            new Ratings(80, 20, null),
            new Ratings(
              9.3,
              2260000,
              '<svg id="home_img">This is the logo.</svg>'
            )
          )
        );
      });
    });
  });

  describe('Numeric formatting', function () {
    let imdbPage;

    before(async function () {
      imdbPage = new ImdbPage('doc', 'https://url');
    });

    it('write ratings count with thousand grouping', function () {
      imdbPage._groupThousands(3333333).should.equal('3,333,333');
    });

    it(`be based on browser's preferred language`, function () {
      window.navigator = { language: 'hu' };
      const fakeFormat = sinon.fake.returns('formatted number');

      sinon.replace(
        Intl,
        'NumberFormat',
        sinon.fake.returns({ format: fakeFormat })
      );

      imdbPage._groupThousands(666).should.equal('formatted number');

      Intl.NumberFormat.should.have.been.calledOnceWithExactly('hu');
    });
  });
});
