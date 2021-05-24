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

    BackgroundScript.start();

    addMessageListenerSpy.should.have.been.calledOnceWithExactly(
      BackgroundScript._getRemotePageData
    );
  });

  describe('main search algorithm', function () {
    it.skip(`search remote page using "feeling lucky" and return with the scores`, async function () {
      // Uses the html files:
      // - google.com..search...btnI=true&q=The+Shawshank+Redemption+1994+site%3Awww.rottentomatoes.com.html
      // - rottentomatoes.m.shawshank_redemption.html
      const movieInfo = new MovieInfo(
        'The Shawshank Redemption',
        1994,
        'Frank Darabont'
      );

      await BackgroundScript._getRemotePageData({
        movieInfo,
        remotePageName: RottenPage.NAME,
      }).should.eventually.deep.equal(
        new MovieInfoWithRatings(
          new MovieInfo('The Shawshank Redemption', 1994, 'Frank Darabont'),
          `https://www.rottentomatoes.com/m/shawshank_redemption`,
          RottenPage.NAME,
          null,
          new Summary(
            'Critics Consensus',
            '<em>The Shawshank Redemption</em> is an uplifting movie.'
          ),
          new Ratings(
            90,
            71,
            'https://www.rottentomatoes.com/assets/certified_fresh.svg'
          ),
          new Ratings(
            98,
            885688,
            'https://www.rottentomatoes.com/assets/aud_score-fresh.svg'
          )
        )
      );
    });

    it.skip('return with the first result when "feeling lucky" doesn\'t work - one way', async function () {
      // Uses the html files:
      // - google.com..search...btnI=true&q=Amblin'+1968+site%3Awww.rottentomatoes.com.html
      // - rottentomatoes.m.amblin.html
      const movieInfo = new MovieInfo("Amblin'", 1968);

      await BackgroundScript._getRemotePageData({
        movieInfo,
        remotePageName: RottenPage.NAME,
      }).should.eventually.deep.equal(
        new MovieInfoWithRatings(
          new MovieInfo("Amblin'", 1968, null),
          `https://www.rottentomatoes.com/m/amblin`,
          RottenPage.NAME,
          null,
          new Summary('Critics Consensus', 'No consensus yet.'),
          null,
          new Ratings(
            60,
            309,
            'https://www.rottentomatoes.com/assets/aud_score-fresh.svg'
          )
        )
      );
    });

    it('return with the first result when "feeling lucky" doesn\'t work - other way', async function () {
      // Uses the html files:
      // - google.com..search...btnI=true&q=Amblin'+1968+site%3Awww.imdb.com.html
      // - imdb.title.tt0064010.html
      const movieInfo = new MovieInfo("Amblin'", 1968);

      await BackgroundScript._getRemotePageData({
        movieInfo,
        remotePageName: ImdbPage.NAME,
      }).should.eventually.deep.equal(
        new MovieInfoWithRatings(
          new MovieInfo("Amblin'", 1968, null),
          `https://www.imdb.com/title/tt0064010/`,
          ImdbPage.NAME,
          null,
          null,
          null,
          new Ratings(6.4, 1044, '<svg id="home_img">This is the logo.</svg>')
        )
      );
    });

    it.skip('return null if "feeling lucky" is not the movie', function () {});
    it.skip('return null if the first result is not the movie', function () {});
  });

  describe('special cases', function () {
    it('remove "&" character from movie title in search url', function () {
      const movieInfo = new MovieInfo('The Old Man & The Gun', '2018');

      BackgroundScript._constructSearchUrl(
        movieInfo,
        RottenPage.NAME
      ).should.equal(
        'https://www.google.com/search?btnI=true' +
          '&q=The+Old+Man+%26+The+Gun+2018+' +
          `site%3A${RottenPage.HOST_NAME}`
      );
    });
  });
});
