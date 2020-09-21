/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const sinon = require('sinon');

describe('Background script', function () {
  it('register message listener on startup', function () {
    const addMessageListenerSpy = sinon.spy();
    global.browser = {
      runtime: { onMessage: { addListener: addMessageListenerSpy } },
    };

    BackgroundScript.init();

    addMessageListenerSpy.should.have.been.calledOnceWithExactly(
      BackgroundScript.getRemotePageData
    );
  });

  describe('main search algorithm', function () {
    it(`search remote page and return with the scores`, async function () {
      // Uses the html files:
      // - google.search...btnI=true&q=The+Shawshank+Redemption+|
      //      1994+movie+RottenTomatoes.html
      // - rottentomatoes.m.shawshank_redemption.html
      const movieData = {
        title: 'The Shawshank Redemption',
        year: 1994,
      };

      await BackgroundScript.getRemotePageData({
        movieData,
        remotePageName: 'RottenTomatoes',
      }).should.eventually.deep.equal(
        new MovieData(
          'The Shawshank Redemption',
          1994,
          'https://www.rottentomatoes.com/m/shawshank_redemption',
          98,
          885688,
          90,
          71,
          -1
        )
      );
    });
  });

  describe('special cases', function () {
    it('remove "&" character from movie title in search url', function () {
      const movieData = {
        title: 'The Old Man & The Gun',
        year: '2018',
      };

      BackgroundScript.constructSearchUrl(
        movieData,
        `Rotten Tomatoes`
      ).should.equal(
        'https://www.google.com/search?btnI=true' +
          '&q=The+Old+Man++The+Gun+2018+movie' +
          '+Rotten+Tomatoes'
      );
    });
  });
});
