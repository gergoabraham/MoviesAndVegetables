/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

// Functions under test
let addRottenOnLoad;

describe('Content script on IMDb', function() {
  before(function() {
    global.document = {body: {onload: {}}};
    require('../src/addRottenToImdb');
    ({addRottenOnLoad} = window);
  });

  it('should register its function on page loaded event', function() {
    global.document.body.onload
        .should.equal(addRottenOnLoad);
  });

  describe('addRottenOnLoad', function() {
    it('should send message to background with movie data', async function() {
      // todo: Tests are not independent. These functions are visible, because
      // they are added to `window`. Let's get rid of this in the future.
      sinon.replace(window, 'readMovieDataFromImdbPage',
          sinon.fake.returns('movieData'));
      sinon.replace(window, 'injectTomatoMeter',
          sinon.fake());
      global.browser = {runtime:
          {sendMessage: sinon.fake.resolves({
            tomatoMeter: 90,
            audienceScore: 85,
            url: 'rottenURL',
            tomatoMeterCount: 68,
            audienceScoreCount: 885203,
          })},
      };

      sinon.replace(window, 'injectAudienceScore', sinon.spy());

      await addRottenOnLoad();

      window.readMovieDataFromImdbPage
          .should.have.been.calledOnceWithExactly(global.document);

      global.browser.runtime.sendMessage
          .should.have.been.calledOnceWithExactly(
              {movieData: 'movieData', remotePage: 'Rotten Tomatoes'}
          );

      window.injectAudienceScore
          .should.have.been.calledOnceWithExactly(
              global.document, 85, 'rottenURL', 885203
          );
      window.injectTomatoMeter
          .should.have.been.calledOnceWithExactly(
              global.document, 90, 'rottenURL', 68);
    });
  });
});
