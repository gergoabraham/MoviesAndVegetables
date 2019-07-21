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

  describe.only('injectTomatoMeter', function() {
    let titleReviewBar;

    context('Injecting', function() {
      beforeEach(async function() {
        const dom = await JSDOM.fromFile('./test/testImdbPage.html',
            {url: `https://www.imdb.com/title/tt0111161/`});
        document = dom.window.document;

        titleReviewBar =
          document.getElementsByClassName('titleReviewBar')[0];
      });

      it('should inject TomatoMeter and a divider next to MetaScore', function() {
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

    context('Details', function() {
      let tomatoMeter;
      const rottenURL = 'https://www.rottentomatoes.com/m/shawshank_redemption';

      before(async function() {
        const dom = await JSDOM.fromFile('./test/testImdbPage.html',
            {url: `https://www.imdb.com/title/tt0111161/`});
        document = dom.window.document;

        titleReviewBar =
          document.getElementsByClassName('titleReviewBar')[0];

        injectTomatoMeter(document, 93, rottenURL, 68);

        tomatoMeter = titleReviewBar.children[2];
      });

      it('should build HTML for TomatoMeterPercentage', function() {
        tomatoMeter.children[0].tagName.should.equal('A');
        tomatoMeter.children[0].children[0].tagName.should.equal('DIV');
        tomatoMeter.children[0].children[0].children[0].tagName.should.equal('SPAN');

        tomatoMeter.children[0].children[0].getAttribute('class')
            .should.contain('metacriticScore')
            .and.contain('score_')
            .and.contain('titleReviewBarSubItem');

        tomatoMeter.childNodes[1].data
            .should.equal(' ');
      });

      it('should build HTML for description', function() {
        tomatoMeter.children[1].tagName.should.equal('DIV');
        tomatoMeter.children[1].getAttribute('class')
            .should.equal('titleReviewBarSubItem');

        // First line
        tomatoMeter.children[1].children[0].tagName.should.equal('DIV');
        tomatoMeter.children[1].children[0].children[0].tagName.should.equal('A');

        // Second line
        tomatoMeter.children[1].children[1].tagName.should.equal('DIV');
        tomatoMeter.children[1].children[1].children[0].tagName.should.equal('SPAN');
        tomatoMeter.children[1].children[1].children[0]
            .getAttribute('class').should.equal('subText');
      });

      it('should inject correct TomatoMeter percentage', function() {
        const score = tomatoMeter.children[0].children[0].children[0];
        score.innerHTML.should.equal('93%');
      });

      it('should add URL on TomatoMeter percentage', function() {
        tomatoMeter.children[0].getAttribute('href').should.equal(rottenURL);
      });

      it('should format TomatoMeter percentage wider', function() {
        const tomatoMeterContainer = tomatoMeter.children[0].children[0];
        tomatoMeterContainer.getAttribute('style').should.equal('width: 40px');
      });

      it('should write "TomatoMeter" description next to percentage', function() {
        const tomatoMeterDescription = tomatoMeter.children[1].children[0].children[0];
        tomatoMeterDescription.innerHTML.should.equal('Tomatometer');
      });

      it('should add rotten URL for "TomatoMeter" description', function() {
        const tomatoMeterDescription = tomatoMeter.children[1].children[0].children[0];
        tomatoMeterDescription.getAttribute('href')
            .should.equal(rottenURL);
      });

      it('should write number of votes', function() {
        const tomatoMeterSubDescription = tomatoMeter.children[1].children[1].children[0];
        tomatoMeterSubDescription.innerHTML.should.equal(`Total Count: 68`);
      });
    });

    context('Favorableness', function() {
      const unfavorable = 'score_unfavorable';
      const mixed = 'score_mixed';
      const favorable = 'score_favorable';


      before(async function() {
        const dom = await JSDOM.fromFile('./test/testImdbPage.html',
            {url: `https://www.imdb.com/title/tt0111161/`});
        document = dom.window.document;
      });

      it('should change favorableness based on TomatoMeter', function() {
        sinon.replace(window, 'getFavorableness',
            sinon.fake.returns('fakeFavorableness'));

        injectTomatoMeter(document, 93, 'someUrl');

        window.getFavorableness.should.have.been.calledOnceWithExactly(93);
        const titleReviewBar =
          document.getElementsByClassName('titleReviewBar')[0];
        const tomatoMeter = titleReviewBar.children[2];
        const tomatoMeterContainer = tomatoMeter.children[0].children[0];

        tomatoMeterContainer.getAttribute('class')
            .should.contain('fakeFavorableness')
            .but.not.contain('score_favorable');
      });

      it('should give unfavorable style in 0...40', function() {
        getFavorableness(0).should.equal(unfavorable);
        getFavorableness(33).should.equal(unfavorable);
        getFavorableness(40).should.equal(unfavorable);
      });

      it('should give mixed style in 41...60', function() {
        getFavorableness(41).should.equal(mixed);
        getFavorableness(50).should.equal(mixed);
        getFavorableness(60).should.equal(mixed);
      });

      it('should give favorable style in 61...100', function() {
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
