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
    global.document = {
      body: {onload: {}},
      baseURI: 'page url',
    };
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
      let imdbPageConstructorParameterDoc;
      let imdbPageConstructorParameterUrl;
      global.ImdbPage = class {
        constructor(doc, url) {
          imdbPageConstructorParameterDoc = doc;
          imdbPageConstructorParameterUrl = url;
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

      imdbPageConstructorParameterDoc.should.equal(global.document);
      imdbPageConstructorParameterUrl.should.equal('page url');

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
