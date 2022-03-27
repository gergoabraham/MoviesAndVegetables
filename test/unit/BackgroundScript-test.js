/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const sinon = require('sinon');
const { shouldBeSimilar } = require('./MoviePages/helper');

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
    it(`search remote page using "feeling lucky" and return with the scores`, async function () {
      const movieInfo = new MovieInfo(
        'The Shawshank Redemption',
        1994,
        'Frank Darabont'
      );

      const actual = await BackgroundScript._getRemotePageData({
        movieInfo,
        remotePageName: RottenPage.NAME,
      });

      const expected = new MovieInfoWithRatings(
        new MovieInfo('The Shawshank Redemption', 1994, 'Frank Darabont'),
        `https://www.rottentomatoes.com/m/shawshank_redemption`,
        RottenPage.NAME,
        null,
        new Summary(
          'Critics Consensus',
          '<em>The Shawshank Redemption</em> is an uplifting, deeply satisfying prison drama with sensitive direction and fine performances.'
        ),
        new Ratings(91, 82, /certified_fresh.+svg$/),
        new Ratings(98, 887391, /aud_score-fresh.+svg$/)
      );

      shouldBeSimilar(expected, actual);
    });

    it('return with the first result when "feeling lucky" doesn\'t work - one way', async function () {
      const movieInfo = new MovieInfo("Amblin'", 1968, 'Steven Spielberg');

      const actual = await BackgroundScript._getRemotePageData({
        movieInfo,
        remotePageName: RottenPage.NAME,
      });

      const expected = new MovieInfoWithRatings(
        new MovieInfo("Amblin'", 1968, 'Steven Spielberg'),
        `https://www.rottentomatoes.com/m/amblin`,
        RottenPage.NAME,
        null,
        null,
        null,
        new Ratings(60, 310, /aud_score-fresh.+svg/)
      );

      shouldBeSimilar(expected, actual);
    });
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
