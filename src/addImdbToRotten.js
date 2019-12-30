/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

window.addImdbOnLoad = function() {
  const movieData = window.readMovieDataFromRottenPage(document);

  browser.runtime.sendMessage({movieData, remotePage: 'IMDb'})
      .then((response) => {
        window.injectUserScore(document,
            response.userScore, response.url, response.userScoreCount);
        window.injectMetaScore(document,
            response.metaScore, response.url, response.metaScoreCount);
      });
};

window.addImdbOnLoad();
