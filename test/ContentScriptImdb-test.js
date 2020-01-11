/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

// Functions under test
let addRottenOnLoad;

const {MovieData} = require('../src/MoviePages/MovieData');

describe('Content script on IMDb', function() {
  before(function() {
    global.document = {body: {onload: {}}};
    ({addRottenOnLoad} = require('../src/ContentScriptImdb'));
  });

  it('should register its function on page loaded event', function() {
    global.document.body.onload
        .should.equal(addRottenOnLoad);
  });

  describe('addRottenOnLoad', function() {
    it('should send message to background with movie data', async function() {
      const movieData = new MovieData(
          'title', 2007, 'rottenURL',
          85, 885203,
          90, 68
      );

      const fakeImdbPageGetMovieData = sinon.fake.returns('movieData');
      const fakeImdbPageInjectRatings = sinon.fake();
      let imdbPageConstructorParameter;
      global.ImdbPage = class {
        constructor(doc) {
          imdbPageConstructorParameter = doc;
          return {
            getMovieData: fakeImdbPageGetMovieData,
            injectRatings: fakeImdbPageInjectRatings,
          };
        }
      };

      global.browser = {runtime:
          {sendMessage: sinon.fake.resolves(movieData)},
      };

      await addRottenOnLoad();

      imdbPageConstructorParameter.should.equal(global.document);

      fakeImdbPageGetMovieData.should.have.been.calledOnce;

      global.browser.runtime.sendMessage
          .should.have.been.calledOnceWithExactly(
              {movieData: 'movieData', remotePage: 'Rotten Tomatoes'}
          );

      fakeImdbPageInjectRatings.should.have.been.calledOnceWithExactly(
          movieData
      );
    });
  });
});
