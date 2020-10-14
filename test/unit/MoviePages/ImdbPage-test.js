/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');
const sinon = require('sinon');

describe('ImdbPage', function () {
  const rottenURL = 'https://www.rottentomatoes.com/m/blabla';

  async function getTestDOM(url) {
    const response = await fetch(url);
    const fileContent = await response.text();

    return new JSDOM(fileContent).window.document;
  }

  async function readMovieDataByImdbPage(url) {
    const document = await getTestDOM(url);
    const imdbPage = new ImdbPage(document, url);

    return imdbPage.getMovieData();
  }

  it('can be instantiated', function () {
    const imdbPage = new ImdbPage(
      'input doc',
      `https://www.imdb.com/title/tt0111161/?pf_rd_t=15506&pf_rd_i=top`
    );

    imdbPage.document.should.equal('input doc');
    imdbPage.url.should.equal(`https://www.imdb.com/title/tt0111161/`);
  });

  describe('getMovieData', function () {
    context(`on a movie with ratings`, function () {
      it('read all stuff', async function () {
        const movieData = await readMovieDataByImdbPage(
          'https://www.imdb.com/title/tt0111161/'
        );

        movieData.should.deep.equal(
          new MovieData(
            'The Shawshank Redemption',
            1994,
            'https://www.imdb.com/title/tt0111161/',
            9.3,
            2260000,
            80,
            20,
            1,
            '<svg id="home_img">This is the logo.</svg>',
            '#66Cc33'
          )
        );
      });
    });

    context(`on a movie without ratings`, function () {
      let movieData;

      before(`let's check some unimportant data`, async function () {
        const url = 'https://www.imdb.com/title/tt5637536/';
        const document = await getTestDOM(url);
        const imdbPage = new ImdbPage(document, url);

        movieData = await imdbPage.getMovieData();
        movieData.should.contain({ title: 'Avatar 5' });
        movieData.should.contain({ year: 2028 });
      });

      it('read all stuff', async function () {
        const movieData = await readMovieDataByImdbPage(
          'https://www.imdb.com/title/tt5637536/'
        );

        movieData.should.deep.equal(
          new MovieData(
            'Avatar 5',
            2028,
            'https://www.imdb.com/title/tt5637536/',
            null,
            null,
            null,
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
        const movieData = await readMovieDataByImdbPage(
          'https://www.imdb.com/title/tt5637536/'
        );

        movieData.should.contain({ toplistPosition: null });
      });
    });

    context(`on a series' imdb page`, function () {
      it('reject (for now, TODO)', async function () {
        const url = 'https://www.imdb.com/title/tt0149460/';
        const document = await getTestDOM(url);
        const imdbPage = new ImdbPage(document, url);

        await imdbPage
          .getMovieData()
          .should.be.rejectedWith(Error, 'Not a movie');
      });
    });
  });

  describe('injectRatings', function () {
    context('all scores are present', function () {
      context('Tomatometer', function () {
        let titleReviewBar;

        before(async function () {
          const url = 'https://www.imdb.com/title/tt0111161/';
          const document = await getTestDOM(url);
          const imdbPage = new ImdbPage(document, url);

          imdbPage.injectRatings(
            new MovieData(
              'Movie Title',
              2002,
              rottenURL,
              85,
              666,
              93,
              1268,
              null,
              'user-rating-logo.svg',
              'critics-score-logo.svg'
            )
          );

          titleReviewBar = document.getElementsByClassName('titleReviewBar')[0];
        });

        it('add TomatoMeter inside dividers after MetaScore', function () {
          titleReviewBar.children[0].className.should.equal(
            'titleReviewBarItem'
          );
          titleReviewBar.children[1].className.should.equal('divider');

          titleReviewBar.children[2].id.should.equal('mv-tomatometer');
          titleReviewBar.children[2].className.should.equal(
            'titleReviewBarItem'
          );

          titleReviewBar.children[3].className.should.equal('divider');
        });

        it('add TomatoMeter with correct data and format', function () {
          const tomatoMeter = titleReviewBar.children[2];

          tomatoMeter.outerHTML.should.equal(
            `<div class="titleReviewBarItem" id="mv-tomatometer">` +
              `    <a href="${rottenURL}" title="Movie Title on RottenTomatoes">` +
              `<img src="critics-score-logo.svg" height="27px" width="27px" style="vertical-align: baseline;"><div class="metacriticScore titleReviewBarSubItem" style="width: 40px; color: black">` +
              `<span>93%</span>` +
              `        </div><div class="titleReviewBarSubItem">` +
              `            <div>Tomatometer</div>` +
              `            <div><span class="subText">Total Count: 1,268</span></div>` +
              `        </div>` +
              `    </a>` +
              `</div>`
          );
        });
      });

      context('AudienceScore', function () {
        let ratingsWrapper;
        let document;

        before(async function () {
          const url = 'https://www.imdb.com/title/tt0111161/';
          document = await getTestDOM(url);
          const imdbPage = new ImdbPage(document, url);

          imdbPage.injectRatings(
            new MovieData(
              'Movie Title',
              2002,
              rottenURL,
              98,
              885228,
              93,
              1268,
              null,
              'user-rating-logo.svg',
              'critics-score-logo.svg'
            )
          );

          ratingsWrapper = document.getElementsByClassName(
            'ratings_wrapper'
          )[0];
        });

        it('add AudienceScore before star-rating-widget', function () {
          ratingsWrapper.children[1].id.should.equal('mv-audience-score');
          ratingsWrapper.children[2].id.should.equal('star-rating-widget');
        });

        it('add AudienceScore with correct data and format', function () {
          const audienceScore = document.getElementById('mv-audience-score');

          audienceScore.outerHTML.should.equal(
            `<div class="imdbRating" id="mv-audience-score"` +
              ` style="background: none; text-align: center; padding: 0px 10px 0px 5px; ` +
              `width: 100px; display: flex; align-items: center; border-left: 1px solid #6b6b6b;">` +
              `<img src="user-rating-logo.svg" height="27px" width="27px">` +
              `    <div>` +
              `        <div class="ratingValue">` +
              `            <strong title="Audience score from RottenTomatoes">` +
              `                <span itemprop="ratingValue">98%</span>` +
              `            </strong>` +
              `        </div>` +
              `        <a href="${rottenURL}">` +
              `            <span class="small" itemprop="ratingCount">885,228</span>` +
              `        </a>` +
              `    </div>` +
              `</div>`
          );
        });

        it('increase the width of the User Score', function () {
          ratingsWrapper.children[0].style.width.should.equal('95px');
        });

        it("modify ratings_wrapper's width to auto", function () {
          ratingsWrapper.style.width.should.equal('auto');
        });
      });
    });

    context('no ratings yet on remote page', function () {
      let document;

      before(async function () {
        const url = 'https://www.imdb.com/title/tt0111161/';
        document = await getTestDOM(url);
        const imdbPage = new ImdbPage(document, url);

        imdbPage.injectRatings(
          new MovieData(
            'Movie Title',
            2002,
            rottenURL,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          )
        );
      });

      it('no tomatometer', function () {
        const tomatoMeter = document.getElementById('mv-tomatometer');

        tomatoMeter.outerHTML.should.equal(
          `<div class="titleReviewBarItem" id="mv-tomatometer">` +
            `    <a href="${rottenURL}" title="Movie Title on RottenTomatoes">` +
            `        <div class="metacriticScore score_tbd titleReviewBarSubItem" style="width: 40px">` +
            `            <span style="color:black">-</span>` +
            `        </div>` +
            `</a>` +
            `    <div class="titleReviewBarSubItem">` +
            `        <div>` +
            `            <a href="${rottenURL}">Tomatometer</a>` +
            `        </div>` +
            `        <div>` +
            `            <span class="subText">Total Count: N/A</span>` +
            `        </div>` +
            `    </div>` +
            `</div>`
        );
      });

      it('no AudienceScore', function () {
        const audienceScore = document.getElementById('mv-audience-score');

        audienceScore.outerHTML.should.equal(
          `<div class="imdbRating" id="mv-audience-score"` +
            ` style="background: none; text-align: center; padding: 2px 0px 0px 2px; ` +
            `width: 90px; border-left: 1px solid #6b6b6b;">` +
            `    <div class="ratingValue">` +
            `        <strong title="Audience score from RottenTomatoes">` +
            `            <span itemprop="ratingValue">-</span>` +
            `        </strong>` +
            `    </div>` +
            `    <a href="${rottenURL}">` +
            `        <span class="small" itemprop="ratingCount">N/A</span>` +
            `    </a>` +
            `</div>`
        );
      });
    });

    context('missing structures on imdb', function () {
      async function injectDummyRatings(url) {
        const document = await getTestDOM(url);
        const imdbPage = new ImdbPage(document, url);

        imdbPage.injectRatings(
          new MovieData(
            'Movie Title',
            2002,
            rottenURL,
            66,
            666,
            66,
            666,
            null,
            'user-rating-logo.svg',
            'critics-score-logo.svg'
          )
        );

        return document;
      }

      context('for Tomatometer', function () {
        it('no metacritics - but multiple items in review bar', async function () {
          const document = await injectDummyRatings(
            'https://www.imdb.com/title/tt0067023/'
          );
          const titleReviewBar = getTitleReviewBar(document);

          titleReviewBar.children[0].id.should.equal('mv-tomatometer');
          titleReviewBar.children[1].className.should.equal('divider');
          titleReviewBar.children[2].className.should.equal(
            'titleReviewBarItem'
          );
        });

        it('no metacritics, no dividers in review bar', async function () {
          const document = await injectDummyRatings(
            'https://www.imdb.com/title/tt0064010/'
          );
          const titleReviewBar = getTitleReviewBar(document);

          titleReviewBar.children[0].id.should.equal('mv-tomatometer');
          titleReviewBar.children[1].className.should.equal('divider');
        });

        it('no review bar', async function () {
          const document = await injectDummyRatings(
            'https://www.imdb.com/title/tt5637536/'
          );
          const titleReviewBar = getTitleReviewBar(document);

          titleReviewBar.children.length.should.equal(1);
          titleReviewBar.children[0].id.should.equal('mv-tomatometer');
        });
      });

      context('for Audiencescore - no user rating', function () {
        let document;

        before(async function () {
          document = await injectDummyRatings(
            'https://www.imdb.com/title/tt5637536/'
          );
        });

        it('ratings_wrapper is added to title_bar_wrapper as first child', async function () {
          document
            .getElementsByClassName('title_bar_wrapper')[0]
            .children[0].className.should.equal('ratings_wrapper');
        });

        it('ratings_wrapper width is auto', function () {
          document
            .getElementsByClassName('ratings_wrapper')[0]
            .style.width.should.equal('auto');
        });

        it('AudienceScore is added to ratings_wrapper', function () {
          document
            .getElementsByClassName('ratings_wrapper')[0]
            .children[0].id.should.equal('mv-audience-score');
        });

        it('AudienceScore has no border', function () {
          document
            .getElementById('mv-audience-score')
            .style.borderLeft.should.equal('');
        });
      });
    });
  });

  describe('Numeric formatting', function () {
    let imdbPage;

    before(async function () {
      imdbPage = new ImdbPage('doc', 'https://url');
    });

    it('write number of votes with thousand grouping', function () {
      imdbPage.groupThousands(3333333).should.equal('3,333,333');
    });

    it(`be based on browser's preferred language`, function () {
      window.navigator = { language: 'hu' };
      const fakeFormat = sinon.fake.returns('formatted number');
      sinon.replace(
        Intl,
        'NumberFormat',
        sinon.fake.returns({ format: fakeFormat })
      );

      imdbPage.groupThousands(666).should.equal('formatted number');

      Intl.NumberFormat.should.have.been.calledOnceWithExactly('hu');
    });
  });
});

function getTitleReviewBar(document) {
  return document.getElementsByClassName('titleReviewBar')[0];
}
