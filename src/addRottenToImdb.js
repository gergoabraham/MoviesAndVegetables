/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

function addRottenOnLoad() {
  const movieData = window.readMovieDataFromImdbPage(document);
  const moviePage = new MoviePage();

  browser.runtime.sendMessage({movieData, remotePage: moviePage.remoteName})
      .then((response) => {
        window.injectAudienceScore(document,
            response.audienceScore, response.url, response.audienceScoreCount);
        window.injectTomatoMeter(document,
            response.tomatoMeter, response.url, response.tomatoMeterCount);
      });
};

document.body.onload = addRottenOnLoad;

if (typeof module !== 'undefined') {
  module.exports = {addRottenOnLoad};
}
