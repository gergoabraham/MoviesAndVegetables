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

    return imdbPage.getMovieInfoWithRatings();
  }

  it('can be instantiated', function () {
    const imdbPage = new ImdbPage(
      'input doc',
      `https://www.imdb.com/title/tt0111161/?pf_rd_t=15506&pf_rd_i=top`
    );

    imdbPage.document.should.equal('input doc');
    imdbPage.url.should.equal(`https://www.imdb.com/title/tt0111161/`);
  });

  describe('getMovieInfo', function () {
    it('read the basic stuff', async function () {
      const url = 'https://www.imdb.com/title/tt0111161/';
      const document = await getTestDOM(url);
      const imdbPage = new ImdbPage(document, url);

      const movie = await imdbPage.getMovieInfo();

      movie.should.deep.equal(new MovieInfo('The Shawshank Redemption', 1994));
    });
  });

  describe('getMovieInfoWithRatings', function () {
    context(`on a movie with ratings`, function () {
      it('read all stuff', async function () {
        const movie = await readMovieDataByImdbPage(
          'https://www.imdb.com/title/tt0111161/'
        );

        movie.should.deep.equal(
          new MovieInfoWithRatings(
            new MovieInfo('The Shawshank Redemption', 1994),
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
          'https://www.imdb.com/title/tt5637536/'
        );

        movie.should.deep.equal(
          new MovieInfoWithRatings(
            new MovieInfo('Avatar 5', 2028),
            'https://www.imdb.com/title/tt5637536/',
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
          'https://www.imdb.com/title/tt5637536/'
        );

        movie.should.contain({ toplistPosition: null });
      });
    });

    context(`on a series' imdb page`, function () {
      it('reject (for now, TODO)', async function () {
        const url = 'https://www.imdb.com/title/tt0149460/';
        const document = await getTestDOM(url);
        const imdbPage = new ImdbPage(document, url);

        await imdbPage
          .getMovieInfoWithRatings()
          .should.be.rejectedWith(Error, 'Not a movie');
      });
    });
  });

  describe('injectRatings', function () {
    async function injectDefaultRatings(url) {
      const document = await getTestDOM(url);
      const imdbPage = new ImdbPage(document, url);

      imdbPage.injectRatings(
        new MovieInfoWithRatings(
          new MovieInfo('Movie Title', 2002),
          rottenURL,
          'Other Page',
          null,
          new Summary('Summary Title', 'This is a hellova good movie!'),
          new Ratings(93, 1268, 'critics-score-logo.svg'),
          new Ratings(98, 885228, 'user-rating-logo.svg')
        )
      );

      return document;
    }

    context('all scores are present', function () {
      let document;

      before(async function () {
        const url = 'https://www.imdb.com/title/tt0111161/';
        document = await injectDefaultRatings(url);
      });

      context('Tomatometer', function () {
        let titleReviewBar;

        before(function () {
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
              `    <a href="${rottenURL}" title="Open Movie Title on Other Page" style="text-decoration: none">` +
              `        <img src="critics-score-logo.svg" height="27px" width="27px" style="vertical-align: baseline">` +
              `        <div class="metacriticScore titleReviewBarSubItem" style="color: black">` +
              `            <span>93%</span>` +
              `        </div>` +
              `        <div class="titleReviewBarSubItem">` +
              `            <div>Tomatometer</div>` +
              `            <div>` +
              `                <span class="subText">Total Count: 1,268</span>` +
              `            </div>` +
              `        </div>` +
              `    </a>` +
              `</div>`
          );
        });
      });

      context('AudienceScore', function () {
        let ratingsWrapper;

        before(function () {
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
            `<div class="imdbRating" id="mv-audience-score" style="background: none; text-align: center; padding: 0px; width: 100px; border-left: 1px solid #6b6b6b;">` +
              `    <a href="${rottenURL}" title="Open Movie Title on Other Page" style="text-decoration: none">` +
              `        <div style="display: flex; align-items: center; justify-content: center; height: 40px;">` +
              `            <img src="user-rating-logo.svg" height="32px" width="32px">` +
              `            <div>` +
              `                <div class="ratingValue">` +
              `                    <strong style="color: white">` +
              `                        <span itemprop="ratingValue">98%</span>` +
              `                    </strong>` +
              `                </div>` +
              `                <span class="small" itemprop="ratingCount">885,228</span>` +
              `            </div>` +
              `        </div>` +
              `    </a>` +
              `</div>`
          );
        });

        it('increase the width of the User Ratings element', function () {
          ratingsWrapper.children[0].style.width.should.equal('95px');
        });

        it("modify ratings_wrapper's width to auto", function () {
          ratingsWrapper.style.width.should.equal('auto');
        });
      });

      context('Critics consensus', function () {
        it('add Critics Consensus below titleReviewBar', function () {
          document
            .getElementsByClassName('titleReviewBar')[0]
            .nextElementSibling.id.should.equal('mv-critics-consensus');
        });

        it('add Critics Consensus with correct data and format', function () {
          document
            .querySelector('#mv-critics-consensus')
            .innerHTML.should.equal(
              `<a` +
                ` href="${rottenURL}"` +
                ` title="Open Movie Title on Other Page"` +
                ` style="text-decoration: none; color: #333"` +
                `>` +
                `  <div style="padding: 0px 20px 18px 20px; display: flex; align-items: center">` +
                `    <h4 style="padding-right: 20px">Summary Title:</h4>` +
                `    <div>This is a hellova good movie!</div>` +
                `  </div>` +
                `</a>`
            );
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
          new MovieInfoWithRatings(
            new MovieInfo('Movie Title', 2002),
            rottenURL,
            'Other Page',
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
            `    <a href="${rottenURL}" title="Open Movie Title on Other Page" style="text-decoration: none;">` +
            `        <div class="metacriticScore titleReviewBarSubItem" style="color: black">` +
            `            <span style="color: black;">-</span>` +
            `        </div>` +
            `        <div class="titleReviewBarSubItem">` +
            `            <div>Tomatometer</div>` +
            `            <div>` +
            `                <span class="subText">Total Count: N/A</span>` +
            `            </div>` +
            `        </div>` +
            `    </a>` +
            `</div>`
        );
      });

      it('no AudienceScore', function () {
        const audienceScore = document.getElementById('mv-audience-score');

        audienceScore.outerHTML.should.equal(
          `<div class="imdbRating" id="mv-audience-score" style="background: none; text-align: center; padding-left: 0px; width: 90px; border-left: 1px solid #6b6b6b;">` +
            `    <a href="${rottenURL}" title="Open Movie Title on Other Page" style="text-decoration: none;">` +
            `        <div class="ratingValue">` +
            `            <strong>` +
            `                <span itemprop="ratingValue">-</span>` +
            `            </strong>` +
            `        </div>` +
            `        <span class="small" itemprop="ratingCount">N/A</span>` +
            `    </a>` +
            `</div>`
        );
      });
    });

    context('missing structures on imdb', function () {
      context('for Tomatometer', function () {
        it('no metacritics - but multiple items in review bar', async function () {
          const document = await injectDefaultRatings(
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
          const document = await injectDefaultRatings(
            'https://www.imdb.com/title/tt0064010/'
          );
          const titleReviewBar = getTitleReviewBar(document);

          titleReviewBar.children[0].id.should.equal('mv-tomatometer');
          titleReviewBar.children[1].className.should.equal('divider');
        });

        it('no review bar', async function () {
          const document = await injectDefaultRatings(
            'https://www.imdb.com/title/tt5637536/'
          );
          const titleReviewBar = getTitleReviewBar(document);

          titleReviewBar.children.length.should.equal(1);
          titleReviewBar.children[0].id.should.equal('mv-tomatometer');
        });
      });

      context('for Audiencescore - no user ratings', function () {
        let document;

        before(async function () {
          document = await injectDefaultRatings(
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

    it('write ratings count with thousand grouping', function () {
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
