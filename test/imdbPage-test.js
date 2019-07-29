'use strict';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

let document;

// Functions under test
require('../src/imdbPage');
const {readMovieDataFromImdbPage,
  injectAudienceScore,
  injectTomatoMeter,
  getFavorableness,
  groupThousands} = window;

describe('imdbPage', function() {
  const rottenURL = 'https://www.rottentomatoes.com/m/shawshank_redemption';

  async function prepareTestDocument(filename = 'testImdbPage.html') {
    const dom = await JSDOM.fromFile(`./test/${filename}`,
        {url: `https://www.imdb.com/title/tt0111161/`});
    document = dom.window.document;
  }

  before(function() {
    global.DOMParser = new JSDOM().window.DOMParser;
  });

  describe('readMovieDataFromImdbPage', function() {
    context(`on a movie's imdb page`, function() {
      before(async function() {
        await prepareTestDocument();
      });

      it('should read movie title', function() {
        const movieData = readMovieDataFromImdbPage(document);
        movieData['title'].should.deep.equal('The Shawshank Redemption');
      });

      it('should read movie\'s release year', function() {
        const movieData = readMovieDataFromImdbPage(document);
        movieData['year'].should.deep.equal('1994');
      });
    });

    context(`on a series' imdb page`, function() {
      before(async function() {
        await prepareTestDocument('testImdbPage-Series.html');
      });

      it('should throw an error (for now, TODO)', function() {
        (function() {
          readMovieDataFromImdbPage(document);
        }).should.throw('Not a movie');
      });
    });
  });

  describe('injectTomatoMeter', function() {
    let titleReviewBar;

    context('Adding', function() {
      before(async function() {
        await prepareTestDocument();

        injectTomatoMeter(document, 93, rottenURL, 1268);

        titleReviewBar =
          document.getElementsByClassName('titleReviewBar')[0];
      });

      it('should add TomatoMeter inside dividers next to MetaScore',
          function() {
            titleReviewBar.children[0].getAttribute('class')
                .should.equal('titleReviewBarItem');
            titleReviewBar.children[1].getAttribute('class')
                .should.equal('divider');

            titleReviewBar.children[2].getAttribute('class')
                .should.contain('titleReviewBarItem')
                .and.contain('TomatoMeter');

            titleReviewBar.children[3].getAttribute('class')
                .should.equal('divider');
          });

      it('should add TomatoMeter with correct data and format', function() {
        const tomatoMeter = titleReviewBar.children[2];

        tomatoMeter.outerHTML.should.equal(
            `<div class="titleReviewBarItem TomatoMeter">\n` +
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
                  `<span class="subText">Total Count: 1 268</span>\n` +
                `</div>\n` +
              `</div>\n` +
            `</div>`
        );
      });
    });

    context('Favorableness', function() {
      before(async function() {
        await prepareTestDocument();
      });

      it('should change favorableness based on TomatoMeter', function() {
        sinon.replace(window, 'getFavorableness',
            sinon.fake.returns('fakeFavorableness'));

        injectTomatoMeter(document, 93, 'someUrl');

        window.getFavorableness.should.have.been.calledOnceWithExactly(93);

        const tomatoMeter =
          document.getElementsByClassName('titleReviewBar')[0].children[2];
        tomatoMeter.innerHTML
            .should.contain('fakeFavorableness')
            .but.not.contain('score_favorable');
      });

      it('should give unfavorable style for Tomatometer 0...40', function() {
        const unfavorable = 'score_unfavorable';
        getFavorableness(0).should.equal(unfavorable);
        getFavorableness(33).should.equal(unfavorable);
        getFavorableness(40).should.equal(unfavorable);
      });

      it('should give mixed style for Tomatometer 41...60', function() {
        const mixed = 'score_mixed';
        getFavorableness(41).should.equal(mixed);
        getFavorableness(50).should.equal(mixed);
        getFavorableness(60).should.equal(mixed);
      });

      it('should give favorable style for Tomatometer 61...100', function() {
        const favorable = 'score_favorable';
        getFavorableness(61).should.equal(favorable);
        getFavorableness(80).should.equal(favorable);
        getFavorableness(100).should.equal(favorable);
      });

      it('should give tbc style if tbd');
    });
  });

  describe('injectAudienceScore', function() {
    before(async function() {
      await prepareTestDocument();

      injectAudienceScore(document, 98, rottenURL, 885228);
    });

    it('should add AudienceScore before star-rating-widget', function() {
      const ratingsWrapper =
        document.getElementsByClassName('ratings_wrapper')[0];

      ratingsWrapper.children[1].id.should.equal('audience-score');
      ratingsWrapper.children[2].id.should.equal('star-rating-widget');
    });

    it('should add AudienceScore with correct data and format', function() {
      const audienceScore = document.getElementById('audience-score');

      audienceScore.outerHTML.should.equal(
          `<div class="imdbRating" id="audience-score" ` +
            `style="background:none; text-align:center; padding:2px 0 0 2px;\n`+
            `width:90px;border-left:1px solid #6b6b6b;">\n` +
            `<div class="ratingValue">\n` +
              `<strong title="Audience score from RottenTomatoes">\n` +
                `<span itemprop="ratingValue">98%</span>\n` +
              `</strong>\n` +
            `</div>\n` +
            `<a href="${rottenURL}">\n` +
              `<span class="small" itemprop="ratingCount">885 228</span>\n` +
            `</a>\n` +
          `</div>`
      );
    });

    it('should remove border from Rating button', function() {
      const starRatingWidget = document.getElementById('star-rating-widget');
      const button = starRatingWidget.children[0].children[0];

      button.getAttribute('style').should.equal('border-left-width: 0px');
    });
  });

  describe('Numeric formatting', function() {
    it('should write number of votes with thousand grouping', function() {
      groupThousands(1).should.equal('1');
      groupThousands(13).should.equal('13');
      groupThousands(913).should.equal('913');
      groupThousands(2913).should.equal('2 913');
      groupThousands(32913).should.equal('32 913');
      groupThousands(632913).should.equal('632 913');
      groupThousands(8632913).should.equal('8 632 913');
      groupThousands(78632913).should.equal('78 632 913');
    });
  });
});
