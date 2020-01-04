/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

// Functions under test
let addImdbOnLoad;

describe('Content script on RottenTomatoes', function() {
  before(function() {
    global.document = {};
    global.browser = {runtime: {sendMessage: sinon.fake.resolves({})}};
    ({addImdbOnLoad} = require('../src/ContentScriptRotten'));
  });

  describe('addImdbOnLoad', function() {
    it('should send message to background with movie data', async function() {
      sinon.replace(window, 'readMovieDataFromRottenPage',
          sinon.fake.returns('movieData'));

      global.browser = {runtime:
            {sendMessage: sinon.fake.resolves({
              metaScore: 72,
              userScore: 8.6,
              url: 'imdbURL',
              metaScoreCount: 138,
              userScoreCount: 7654321,
            })},
      };

      sinon.replace(window, 'injectMetaScore', sinon.fake());
      sinon.replace(window, 'injectUserScore', sinon.spy());

      await addImdbOnLoad();

      window.readMovieDataFromRottenPage
          .should.have.been.calledOnceWithExactly(global.document);

      global.browser.runtime.sendMessage
          .should.have.been.calledOnceWithExactly(
              {movieData: 'movieData', remotePage: 'IMDb'}
          );

      window.injectUserScore
          .should.have.been.calledOnceWithExactly(
              global.document, 8.6, 'imdbURL', 7654321);
      window.injectMetaScore
          .should.have.been.calledOnceWithExactly(
              global.document, 72, 'imdbURL', 138);
    });
  });
});
