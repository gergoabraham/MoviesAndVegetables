'use strict';

/**
 * Wrapper function for addRotten function
 */
function addRottenOnLoad() {
  const movieData = window.readMovieDataFromImdbPage(document);

  browser.runtime.sendMessage(movieData)
      .then((response) => {
        window.injectRottenScore(document,
            `${response.tomatoMeter} + ${response.audienceScore}`,
            response.url);
      });
}

document.body.onload = addRottenOnLoad;
