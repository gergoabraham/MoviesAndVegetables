'use strict';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

let document;

// Functions under test
require('../src/imdbPage');
const {readMovieDataFromImdbPage,
  injectRottenScore,
  injectTomatoMeter,
  getFavorableness} = window;

describe('imdbPage', function() {
  describe('readMovieDataFromImdbPage', function() {
    before(async function() {
      const dom = await JSDOM.fromFile('./test/testImdbPage.html',
          {url: `https://www.imdb.com/title/tt0111161/`});
      document = dom.window.document;
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

  describe('injectTomatoMeter', function() {
    let titleReviewBar;

    context('Position', function() {
      beforeEach(async function() {
        const dom = await JSDOM.fromFile('./test/testImdbPage.html',
            {url: `https://www.imdb.com/title/tt0111161/`});
        document = dom.window.document;
        global.DOMParser = new JSDOM().window.DOMParser;

        titleReviewBar =
          document.getElementsByClassName('titleReviewBar')[0];
      });

      it('should inject TomatoMeter and a divider next to MetaScore',
          function() {
            const dividers = titleReviewBar.getElementsByClassName('divider');

            // Before: 3 item + 2 dividers
            titleReviewBar.childElementCount.should.equal(5);
            dividers.length.should.equal(2);

            injectTomatoMeter(document, 93, 'someUrl');

            // After: 4 item + 3 dividers
            titleReviewBar.childElementCount.should.equal(7);
            dividers.length.should.equal(3);

            // TomatoMeter at position 2
            titleReviewBar.children[2].getAttribute('class')
                .should.contain('titleReviewBarItem')
                .and.contain('TomatoMeter');
          });
    });

    context('Data', function() {
      let tomatoMeter;
      const rottenURL = 'https://www.rottentomatoes.com/m/shawshank_redemption';

      before(async function() {
        const dom = await JSDOM.fromFile('./test/testImdbPage.html',
            {url: `https://www.imdb.com/title/tt0111161/`});
        document = dom.window.document;
        global.DOMParser = new JSDOM().window.DOMParser;

        injectTomatoMeter(document, 93, rottenURL, 68);

        titleReviewBar =
          document.getElementsByClassName('titleReviewBar')[0];
        tomatoMeter = titleReviewBar.children[2];
      });

      it('should add correct TomatoMeter percentage', function() {
        tomatoMeter.innerHTML.should.contain('93');
      });

      it('should add rotten URL', function() {
        tomatoMeter.innerHTML.should.contain(rottenURL);
      });

      it('should add number of votes', function() {
        tomatoMeter.innerHTML.should.contain(`68`);
      });
    });

    context('Favorableness', function() {
      before(async function() {
        const dom = await JSDOM.fromFile('./test/testImdbPage.html');
        document = dom.window.document;
      });

      it('should change favorableness based on TomatoMeter', function() {
        sinon.replace(window, 'getFavorableness',
            sinon.fake.returns('fakeFavorableness'));
        global.DOMParser = new JSDOM().window.DOMParser;

        injectTomatoMeter(document, 93, 'someUrl');

        window.getFavorableness.should.have.been.calledOnceWithExactly(93);
        const titleReviewBar =
          document.getElementsByClassName('titleReviewBar')[0];
        const tomatoMeter = titleReviewBar.children[2];
        tomatoMeter.innerHTML
            .should.contain('fakeFavorableness')
            .but.not.contain('score_favorable');
      });

      it('should give unfavorable style in 0...40', function() {
        const unfavorable = 'score_unfavorable';
        getFavorableness(0).should.equal(unfavorable);
        getFavorableness(33).should.equal(unfavorable);
        getFavorableness(40).should.equal(unfavorable);
      });

      it('should give mixed style in 41...60', function() {
        const mixed = 'score_mixed';
        getFavorableness(41).should.equal(mixed);
        getFavorableness(50).should.equal(mixed);
        getFavorableness(60).should.equal(mixed);
      });

      it('should give favorable style in 61...100', function() {
        const favorable = 'score_favorable';
        getFavorableness(61).should.equal(favorable);
        getFavorableness(80).should.equal(favorable);
        getFavorableness(100).should.equal(favorable);
      });

      it('should give tbc style if tbd');
    });
  });

  describe('injectRottenScore', function() {
    before(async function() {
      const dom = await JSDOM.fromFile('./test/testImdbPage.html',
          {url: `https://www.imdb.com/title/tt0111161/`});
      document = dom.window.document;

      // Function-under-test is called here, to avoid calling it multiple times,
      // which would result in reloading the html file multiple times.
      injectRottenScore(document, 93);
    });

    it('should add child with id "movies-and-vegetables-rotten-rating"',
        function() {
          const ratingsWrapper =
            document.getElementById('star-rating-widget').parentNode;
          const moviesAndVegetables =
            document.getElementById('movies-and-vegetables-rotten-rating');

          should.exist(moviesAndVegetables);
          moviesAndVegetables.parentNode.parentNode
              .should.equal(ratingsWrapper);
        });

    it('should add given percent', function() {
      document.getElementById('movies-and-vegetables-rotten-rating').
          innerHTML.should.equal('🍅93%');
    });
  });
});
