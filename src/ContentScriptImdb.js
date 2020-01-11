/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

function addRottenOnLoad() {
  // eslint-disable-next-line no-undef
  const imdbPage = new ImdbPage(document);
  const movieData = imdbPage.getMovieData();

  browser.runtime.sendMessage({movieData, remotePage: 'Rotten Tomatoes'})
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
