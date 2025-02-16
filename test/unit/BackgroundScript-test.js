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
    it(`search remote page using "feeling lucky" and return the scores`, async function () {
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
        new MovieInfo('The Shawshank Redemption', null, 'Frank Darabont'),
        'https://www.rottentomatoes.com/m/shawshank_redemption',
        RottenPage.NAME,
        null,
        new Summary(
          'Critics Consensus',
          'Steeped in old-fashioned storytelling and given evergreen humanity by Morgan Freeman and Tim Robbins, The Shawshank Redemption chronicles the hardship of incarceration patiently enough to come by its uplift honestly.'
        ),
        new Ratings(91, 80, rottenTomatoesIcons.critics.certifiedPositive),
        new Ratings(
          98,
          250000,
          rottenTomatoesIcons.audienceScore.positive,
          true
        )
      );

      shouldBeSimilar(expected, actual);
    });

    it('return the first result when "feeling lucky" doesn\'t work - one way', async function () {
      const movieInfo = new MovieInfo("Amblin'", 1968, 'Steven Spielberg');

      const actual = await BackgroundScript._getRemotePageData({
        movieInfo,
        remotePageName: RottenPage.NAME,
      });

      const expected = new MovieInfoWithRatings(
        new MovieInfo("Amblin'", null, 'Steven Spielberg'),
        `https://www.rottentomatoes.com/m/amblin`,
        RottenPage.NAME,
        null,
        null,
        null,
        new Ratings(60, 250, rottenTomatoesIcons.audienceScore.positive, true)
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
