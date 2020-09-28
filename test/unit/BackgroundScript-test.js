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
    it(`search remote page using "feeling lucky" and return with the scores`, async function () {
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
        remotePageName: RottenPage.NAME,
      }).should.eventually.deep.equal(
        new MovieData(
          'The Shawshank Redemption',
          1994,
          `https://www.rottentomatoes.com/m/shawshank_redemption`,
          98,
          885688,
          90,
          71,
          null
        )
      );
    });

    it('return with the first result when "feeling lucky" doesn\'t work - one way', async function () {
      // Uses the html files:
      // - google.search...btnI=true&q=Amblin'+1968+|
      //       movie+RottenTomatoes.html;
      // - rottentomatoes.m.amblin.html
      const movieData = {
        title: "Amblin'",
        year: 1968,
      };

      await BackgroundScript.getRemotePageData({
        movieData,
        remotePageName: RottenPage.NAME,
      }).should.eventually.deep.equal(
        new MovieData(
          "Amblin'",
          1968,
          `https://www.rottentomatoes.com/m/amblin`,
          60,
          309,
          null,
          null,
          null
        )
      );
    });

    it('return with the first result when "feeling lucky" doesn\'t work - other way', async function () {
      // Uses the html files:
      // - google.search...btnI=true&q=Amblin'+1968+|
      //       movie+Imdb.html;
      // - imdb.title.tt0064010.html
      const movieData = {
        title: "Amblin'",
        year: 1968,
      };

      await BackgroundScript.getRemotePageData({
        movieData,
        remotePageName: ImdbPage.NAME,
      }).should.eventually.deep.equal(
        new MovieData(
          "Amblin'",
          1968,
          `https://www.imdb.com/title/tt0064010/`,
          6.4,
          1044,
          null,
          null,
          null
        )
      );
    });

    it.skip('return null if "feeling lucky" is not the movie', function () {});
    it.skip('return null if the first result is not the movie', function () {});
  });

  describe('special cases', function () {
    it('remove "&" character from movie title in search url', function () {
      const movieData = {
        title: 'The Old Man & The Gun',
        year: '2018',
      };

      BackgroundScript.constructSearchUrl(
        movieData,
        RottenPage.NAME
      ).should.equal(
        'https://www.google.com/search?btnI=true' +
          '&q=The+Old+Man++The+Gun+2018+movie+' +
          RottenPage.NAME
      );
    });
  });
});
