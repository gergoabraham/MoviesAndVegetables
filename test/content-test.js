'use strict';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

let document;

// Functions under test
let addRottenOnLoad;
let readMovieDataFromImdbPage;
let injectRottenScore;

describe('Content script', function() {
  before(function() {
    global.document = {body: {onload: {}}};
    require('../src/addRottenToImdb');
    ({addRottenOnLoad,
      readMovieDataFromImdbPage,
      injectRottenScore} = window);
  });

  it('should register its function on page loaded event', function() {
    global.document.body.onload
        .should.equal(addRottenOnLoad);
  });

  context('When on a movie\'s imdb page', function() {
    describe('addRottenOnLoad', function() {
      it('should send message to background with movie data', async function() {
        sinon.replace(window, 'readMovieDataFromImdbPage',
            sinon.fake.returns('movieData'));
        global.browser = {runtime:
          {sendMessage: sinon.fake.resolves({
            tomatoMeter: 90,
            audienceScore: 85,
            url: 'rottenURL',
          })},
        };
        sinon.replace(window, 'injectRottenScore', sinon.spy());

        await addRottenOnLoad();

        window.readMovieDataFromImdbPage
            .should.have.been.calledOnceWithExactly(global.document);

        global.browser.runtime.sendMessage
            .should.have.been.calledOnceWithExactly('movieData');

        window.injectRottenScore
            .should.have.been.calledOnceWithExactly(
                global.document, '90 + 85', 'rottenURL'
            );

        sinon.restore();
      });
    });

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

    describe('injectRottenScore', function() {
      before(function() {
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
});
