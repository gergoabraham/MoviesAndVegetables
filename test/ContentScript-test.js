/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

let ContentScript;

const {MovieData} = require('../src/MoviePages/MovieData');

describe('Content script', function() {
  before(function() {
    global.document = {body: {onload: {}}};
    ({ContentScript} = require('../src/ContentScript'));
  });

  describe('injectScores', function() {
    it('should send message to background with movie data', async function() {
      const movieData = new MovieData(
          'title', 2007, 'rottenURL',
          85, 885203,
          90, 68,
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

      await ContentScript.injectScores('RottenTomatoes', 'Imdb');

      imdbPageConstructorParameter.should.equal(global.document);

      fakeImdbPageGetMovieData.should.have.been.calledOnce;

      global.browser.runtime.sendMessage
          .should.have.been.calledOnceWithExactly(
              {movieData: 'movieData', remotePageName: 'RottenTomatoes'},
          );

      fakeImdbPageInjectRatings.should.have.been.calledOnceWithExactly(
          movieData,
      );
    });
  });
});
