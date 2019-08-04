/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

window.addRottenOnLoad = function() {
  const movieData = window.readMovieDataFromImdbPage(document);

  browser.runtime.sendMessage(movieData)
      .then((response) => {
        window.injectAudienceScore(document,
            response.audienceScore, response.url, response.audienceScoreCount);
        window.injectTomatoMeter(document,
            response.tomatoMeter, response.url, response.tomatoMeterCount);
      });
};

document.body.onload = window.addRottenOnLoad;
