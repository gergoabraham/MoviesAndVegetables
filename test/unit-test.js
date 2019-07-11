
const jsdom = require('jsdom');
const {JSDOM} = jsdom; // eslint-disable-line no-unused-vars
const fs = require('fs');

describe('When on a movie\'s imdb page', function() {
  beforeEach(function() {
    sampleImdbPage = fs.readFileSync('./test/testImdbPage.html');
    const dom = new JSDOM(sampleImdbPage);
    document = dom.window.document;
  });

  describe('injectRottenScore', function() {
    it('should add one child to rating-wrapper', function() {
      const ratingsWrapper =
        document.getElementById('star-rating-widget').parentNode;
      ratingsWrapper.childElementCount.should.equal(2);

      injectRottenScore(document);

      ratingsWrapper.childElementCount.should.equal(3);
    });

    it('should child\'s id be movies-and-vegetables-rotten-rating', function() {
      injectRottenScore(document);

      should.exist(
          document.getElementById('movies-and-vegetables-rotten-rating'));
    });

    it('should add given percent', function() {
      injectRottenScore(document, 93);

      document.getElementById('movies-and-vegetables-rotten-rating').
          innerHTML.should.equal('🍅93%');
    });
  });
});


