/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');
const sinon = require('sinon');

describe('ImdbPage', function () {
  const rottenURL = 'https://www.rottentomatoes.com/m/shawshank_redemption';

  async function getTestDocument(
    filename = 'imdb.title.tt0111161 - listed in top250.html'
  ) {
    const dom = await JSDOM.fromFile(FakeHtmlPath + filename);
    return dom.window.document;
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
      let movieData;

      before(async function () {
        const document = await getTestDocument();
        const imdbPage = new ImdbPage(
          document,
          `https://www.imdb.com/title/tt0111161/?pf_rd_t=15506&pf_rd_i=top`
        );

        movieData = await imdbPage.getMovieData();
      });

      it(`read the title`, function () {
        movieData.should.contain({ title: 'The Shawshank Redemption' });
      });

      it(`read the release year`, function () {
        movieData.should.contain({ year: 1994 });
      });

      it(`add the url received on instantiating`, function () {
        movieData.should.contain({
          url: `https://www.imdb.com/title/tt0111161/`,
        });
      });

      it(`read the user rating`, function () {
        movieData.should.contain({ userRating: 9.3 });
      });

      it(`read the number of users' votes`, function () {
        movieData.should.contain({ numberOfUserVotes: 2260000 });
      });

      it(`read the critics rating`, function () {
        movieData.should.contain({ criticsRating: 80 });
      });

      it(`read the number of critics' votes`, function () {
        movieData.should.contain({ numberOfCriticsVotes: 20 });
      });

      it('read toplistPosition', function () {
        movieData.should.contain({ toplistPosition: 1 });
      });

      it('read imdb logo', function () {
        movieData.should.contain({
          userRatingLogo: '<svg id="home_img">This is the logo.</svg>',
        });
      });

      it('read metacritics color', function () {
        movieData.should.contain({
          criticsRatingColor: '#66Cc33',
        });
      });
    });

    context(`on a movie without ratings`, function () {
      let movieData;

      before(`let's check some unimportant data`, async function () {
        const document = await getTestDocument(
          'imdb.title.tt5637536 - no ratings yet.html'
        );
        const imdbPage = new ImdbPage(
          document,
          `https://www.imdb.com/title/tt5637536/`
        );

        movieData = await imdbPage.getMovieData();
        movieData.should.contain({ title: 'Avatar 5' });
        movieData.should.contain({ year: 2028 });
      });

      it(`the user rating is null`, function () {
        movieData.should.contain({ userRating: null });
      });

      it(`the number of users' votes is null`, function () {
        movieData.should.contain({ numberOfUserVotes: null });
      });

      it('the user ratings logo is null', function () {
        movieData.should.contain({ userRatingLogo: null });
      });

      it(`the critics rating is null`, function () {
        movieData.should.contain({ criticsRating: null });
      });

      it(`the number of critics' votes is null because it's not fetched`, function () {
        movieData.should.contain({ numberOfCriticsVotes: null });
      });

      it('the critic ratings color is null', function () {
        movieData.should.contain({ criticsRatingColor: null });
      });

      it('toplistPosition is null', function () {
        movieData.should.contain({ toplistPosition: null });
      });
    });

    context(`on a not top250 movie's imdb page`, function () {
      let movieData;

      before(async function () {
        const document = await getTestDocument(
          `imdb.title.tt5637536 - no ratings yet.html`
        );
        const imdbPage = new ImdbPage(
          document,
          `https://www.imdb.com/title/tt5637536/`
        );

        movieData = await imdbPage.getMovieData();
      });

      it('toplistPosition is null', function () {
        movieData.should.contain({ toplistPosition: null });
      });
    });

    context(`on a series' imdb page`, function () {
      let imdbPage;

      before(async function () {
        const document = await getTestDocument(
          'imdb.title.tt0149460 - series.html'
        );
        imdbPage = new ImdbPage(document, 'https://url');
      });

      it('reject (for now, TODO)', async function () {
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
          const document = await getTestDocument();
          const imdbPage = new ImdbPage(document, 'https://url');
          imdbPage.injectRatings(
            new MovieData(
              'title',
              2002,
              rottenURL,
              85,
              666,
              93,
              1268,
              null,
              '<svg></svg>'
            )
          );

          titleReviewBar = document.getElementsByClassName('titleReviewBar')[0];
        });

        it('add TomatoMeter inside dividers after MetaScore', function () {
          titleReviewBar.children[0].className.should.equal(
            'titleReviewBarItem'
          );
          titleReviewBar.children[1].className.should.equal('divider');

          titleReviewBar.children[2].className.should.equal(
            'titleReviewBarItem'
          );
          titleReviewBar.children[2].id.should.equal('mv-tomatometer');

          titleReviewBar.children[3].className.should.equal('divider');
        });

        it('add TomatoMeter with correct data and format', function () {
          const tomatoMeter = titleReviewBar.children[2];

          tomatoMeter.outerHTML.should.equal(
            `<div class="titleReviewBarItem" id="mv-tomatometer">` +
              `    <a href="${rottenURL}">` +
              `        <div class="metacriticScore score_favorable titleReviewBarSubItem" style="width: 40px">` +
              `            <span>93%</span>` +
              `        </div>` +
              `</a>` +
              `    <div class="titleReviewBarSubItem">` +
              `        <div>` +
              `            <a href="${rottenURL}">Tomatometer</a>` +
              `        </div>` +
              `        <div>` +
              `            <span class="subText">Total Count: 1,268</span>` +
              `        </div>` +
              `    </div>` +
              `</div>`
          );
        });
      });

      context('AudienceScore', function () {
        let ratingsWrapper;
        let document;

        before(async function () {
          document = await getTestDocument();
          const imdbPage = new ImdbPage(document, 'https://url');
          imdbPage.injectRatings(
            new MovieData(
              'title',
              2002,
              rottenURL,
              98,
              885228,
              93,
              1268,
              null,
              '<svg id="upright-logo"></svg>',
              null
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
              `<svg id="upright-logo" style="height: 32px;"></svg>` +
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
        document = await getTestDocument();
        const imdbPage = new ImdbPage(document, 'https://url');
        imdbPage.injectRatings(
          new MovieData(
            'title',
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
            `    <a href="${rottenURL}">` +
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
      async function injectDummyRatings(fileName) {
        const document = await getTestDocument(fileName);
        const imdbPage = new ImdbPage(document, 'https://url');

        imdbPage.injectRatings(
          new MovieData(
            'title',
            2002,
            rottenURL,
            66,
            666,
            66,
            666,
            null,
            '<svg></svg>'
          )
        );

        return document;
      }

      context('for Tomatometer', function () {
        it('no metacritics - but multiple items in review bar', async function () {
          const document = await injectDummyRatings(
            'imdb.title.tt0067023- no metacritics.html'
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
            'imdb.title.tt0064010 - no metacritics, no divider.html'
          );
          const titleReviewBar = getTitleReviewBar(document);

          titleReviewBar.children[0].id.should.equal('mv-tomatometer');
          titleReviewBar.children[1].className.should.equal('divider');
        });

        it('no review bar', async function () {
          const document = await injectDummyRatings(
            'imdb.title.tt5637536 - no ratings yet.html'
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
            'imdb.title.tt5637536 - no ratings yet.html'
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

  describe('"private" methods', function () {
    context('Favorableness', function () {
      let imdbPage;
      let document;

      before(async function () {
        document = await getTestDocument();
        imdbPage = new ImdbPage(document, 'https://url');
      });

      it('change favorableness based on TomatoMeter', function () {
        sinon.replace(
          imdbPage,
          'getFavorableness',
          sinon.fake.returns('fakeFavorableness')
        );

        imdbPage.injectTomatoMeter(document, 93, 'someUrl');

        imdbPage.getFavorableness.should.have.been.calledOnceWithExactly(93);

        const tomatoMeter = document.getElementsByClassName('titleReviewBar')[0]
          .children[2];
        tomatoMeter.innerHTML.should
          .contain('fakeFavorableness')
          .but.not.contain('score_favorable');
      });

      it('give tbd style for null Tomatometer', function () {
        const tbd = 'score_tbd';
        imdbPage.getFavorableness(null).should.equal(tbd);
      });

      it('give unfavorable style for Tomatometer 0...40', function () {
        const unfavorable = 'score_unfavorable';
        imdbPage.getFavorableness(0).should.equal(unfavorable);
        imdbPage.getFavorableness(33).should.equal(unfavorable);
        imdbPage.getFavorableness(40).should.equal(unfavorable);
      });

      it('give mixed style for Tomatometer 41...60', function () {
        const mixed = 'score_mixed';
        imdbPage.getFavorableness(41).should.equal(mixed);
        imdbPage.getFavorableness(50).should.equal(mixed);
        imdbPage.getFavorableness(60).should.equal(mixed);
      });

      it('give favorable style for Tomatometer 61...100', function () {
        const favorable = 'score_favorable';
        imdbPage.getFavorableness(61).should.equal(favorable);
        imdbPage.getFavorableness(80).should.equal(favorable);
        imdbPage.getFavorableness(100).should.equal(favorable);
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
