/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

let document;

const {MoviePage} = require('../../../src/MoviePages/MoviePage');
global.MoviePage = MoviePage;
const {MovieData} = require('../../../src/MoviePages/MovieData');
const {ImdbPage} = require('../../../src/MoviePages/ImdbPage');

describe('ImdbPage', function() {
  const rottenURL = 'https://www.rottentomatoes.com/m/shawshank_redemption';

  async function getTestDocument(filename = 'imdb.title.tt0111161 - listed in top250.html') {
    const dom = await JSDOM.fromFile(`./test/unit/html/${filename}`);
    return dom.window.document;
  }

  it('can be instantiated', function() {
    const imdbPage = new ImdbPage('input doc',
        `https://www.imdb.com/title/tt0111161/?pf_rd_t=15506&pf_rd_i=top`);

    imdbPage.document.should.equal('input doc');
    imdbPage.url.should.equal(`https://www.imdb.com/title/tt0111161/`);
  });

  describe('getMovieData', function() {
    let imdbPage;
    let movieData;

    context(`on a movie's imdb page`, function() {
      before(async function() {
        document = await getTestDocument();
        imdbPage = new ImdbPage(document,
            `https://www.imdb.com/title/tt0111161/?pf_rd_t=15506&pf_rd_i=top`);

        movieData = await imdbPage.getMovieData();
      });

      it(`read the title`, function() {
        movieData.should.contain({title: 'The Shawshank Redemption'});
      });

      it(`read the release year`, function() {
        movieData.should.contain({year: 1994});
      });

      it(`add the url received on instantiating`, function() {
        movieData.should.contain({url: `https://www.imdb.com/title/tt0111161/`});
      });

      it(`read the user rating`, function() {
        movieData.should.contain({userRating: 9.3});
      });

      it(`read the number of users' votes`, function() {
        movieData.should.contain({numberOfUserVotes: 2181187});
      });

      it(`read the critics rating`, function() {
        movieData.should.contain({criticsRating: 80});
      });

      it(`read the number of critics' votes`, function() {
        movieData.should.contain({numberOfCriticsVotes: 20});
      });

      it('read toplistPosition', function() {
        movieData.should.contain({toplistPosition: 1});
      });
    });

    context(`on a not top250 movie's imdb page`, function() {
      before(async function() {
        document = await getTestDocument(`imdb.title.tt7984734 - a simple movie.html`);
        imdbPage = new ImdbPage(document,
            `https://www.imdb.com/title/tt0111161/?pf_rd_t=15506&pf_rd_i=top`);

        movieData = await imdbPage.getMovieData();
      });

      it('not read toplistPosition', function() {
        movieData.should.contain({toplistPosition: -1});
      });
    });

    context(`on a series' imdb page`, function() {
      before(async function() {
        document = await getTestDocument('imdb.title.tt0149460 - series.html');
        imdbPage = new ImdbPage(document, 'https://url');
      });

      it('reject (for now, TODO)', async function() {
        await imdbPage.getMovieData()
            .should.be.rejectedWith(Error);
      });
    });
  });

  describe('injectRatings', function() {
    let titleReviewBar;
    let imdbPage;

    context('Tomatometer', function() {
      before(async function() {
        document = await getTestDocument();
        imdbPage = new ImdbPage(document, 'https://url');
        imdbPage.injectRatings(
            new MovieData(
                'title', 2002, rottenURL,
                85, 666,
                93, 1268));

        titleReviewBar =
          document.getElementsByClassName('titleReviewBar')[0];
      });

      it('add TomatoMeter inside dividers next to MetaScore',
          function() {
            titleReviewBar.children[0].getAttribute('class')
                .should.equal('titleReviewBarItem');
            titleReviewBar.children[1].getAttribute('class')
                .should.equal('divider');

            titleReviewBar.children[2].getAttribute('class')
                .should.equal('titleReviewBarItem');
            titleReviewBar.children[2].getAttribute('id')
                .should.equal('mv-tomatometer');

            titleReviewBar.children[3].getAttribute('class')
                .should.equal('divider');
          });

      it('add TomatoMeter with correct data and format', function() {
        const tomatoMeter = titleReviewBar.children[2];

        tomatoMeter.outerHTML.should.equal(
            `<div class="titleReviewBarItem" id="mv-tomatometer">\n` +
              `<a href="${rottenURL}">\n` +
                `<div class="metacriticScore score_favorable\n` +
                  `titleReviewBarSubItem" style="width: 40px">\n` +
                  `<span>93%</span>\n` +
              `</div></a>\n` +
              `<div class="titleReviewBarSubItem">\n` +
                `<div>\n` +
                  `<a href="${rottenURL}">Tomatometer</a>\n` +
                `</div>\n` +
                `<div>\n` +
                  `<span class="subText">Total Count: 1,268</span>\n` +
                `</div>\n` +
              `</div>\n` +
            `</div>`,
        );
      });
    });

    describe('AudienceScore', function() {
      let ratingsWrapper;

      before(async function() {
        document = await getTestDocument();
        imdbPage = new ImdbPage(document, 'https://url');
        imdbPage.injectRatings(
            new MovieData(
                'title', 2002, rottenURL,
                98, 885228,
                93, 1268));

        ratingsWrapper = document.getElementsByClassName('ratings_wrapper')[0];
      });

      it('add AudienceScore before star-rating-widget', function() {
        ratingsWrapper.children[1].id
            .should.equal('mv-audience-score');
        ratingsWrapper.children[2].id.should.equal('star-rating-widget');
      });

      it('add AudienceScore with correct data and format', function() {
        const audienceScore = document
            .getElementById('mv-audience-score');

        audienceScore.outerHTML.should.equal(
            `<div class="imdbRating" id="mv-audience-score" ` +
              `style="background:none; text-align:center;`+
                                      ` padding:2px 0 0 2px;\n`+
              `width:90px;border-left:1px solid #6b6b6b;">\n` +
              `<div class="ratingValue">\n` +
                `<strong title="Audience score from RottenTomatoes">\n` +
                  `<span itemprop="ratingValue">98%</span>\n` +
                `</strong>\n` +
              `</div>\n` +
              `<a href="${rottenURL}">\n` +
                `<span class="small" itemprop="ratingCount">885,228</span>\n` +
              `</a>\n` +
            `</div>`,
        );
      });

      it('increase the width of the User Score', function() {
        ratingsWrapper.children[0].getAttribute('style')
            .should.contain('width:95px');
      });

      it('remove border from Rating button', function() {
        const starRatingWidget = document.getElementById('star-rating-widget');
        const button = starRatingWidget.children[0].children[0];

        button.getAttribute('style').should.equal('border-left-width: 0px');
      });
    });
  });

  describe('"private" methods', function() {
    context('Favorableness', function() {
      let imdbPage;

      before(async function() {
        document = await getTestDocument();
        imdbPage = new ImdbPage(document, 'https://url');
      });

      it('change favorableness based on TomatoMeter', function() {
        sinon.replace(imdbPage, 'getFavorableness',
            sinon.fake.returns('fakeFavorableness'));

        imdbPage.injectTomatoMeter(document, 93, 'someUrl');

        imdbPage.getFavorableness.should.have.been.calledOnceWithExactly(93);

        const tomatoMeter =
          document.getElementsByClassName('titleReviewBar')[0].children[2];
        tomatoMeter.innerHTML
            .should.contain('fakeFavorableness')
            .but.not.contain('score_favorable');
      });

      it('give unfavorable style for Tomatometer 0...40', function() {
        const unfavorable = 'score_unfavorable';
        imdbPage.getFavorableness(0).should.equal(unfavorable);
        imdbPage.getFavorableness(33).should.equal(unfavorable);
        imdbPage.getFavorableness(40).should.equal(unfavorable);
      });

      it('give mixed style for Tomatometer 41...60', function() {
        const mixed = 'score_mixed';
        imdbPage.getFavorableness(41).should.equal(mixed);
        imdbPage.getFavorableness(50).should.equal(mixed);
        imdbPage.getFavorableness(60).should.equal(mixed);
      });

      it('give favorable style for Tomatometer 61...100', function() {
        const favorable = 'score_favorable';
        imdbPage.getFavorableness(61).should.equal(favorable);
        imdbPage.getFavorableness(80).should.equal(favorable);
        imdbPage.getFavorableness(100).should.equal(favorable);
      });

      it('give TBD style if TBD');
    });
  });

  describe('Numeric formatting', function() {
    let imdbPage;

    before(async function() {
      imdbPage = new ImdbPage('doc', 'https://url');
    });

    it('write number of votes with thousand grouping', function() {
      imdbPage.groupThousands(3333333).should.equal('3,333,333');
    });

    it(`be based on browser's preferred language`, function() {
      window.navigator = {language: 'hu'};
      const fakeFormat = sinon.fake.returns('formatted number');
      sinon.replace(Intl, 'NumberFormat',
          sinon.fake.returns({format: fakeFormat}));

      imdbPage.groupThousands(666).should.equal('formatted number');

      Intl.NumberFormat.should.have.been.calledOnceWithExactly('hu');
    });
  });
});
