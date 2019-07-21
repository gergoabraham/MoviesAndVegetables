'use strict';

window.addRottenOnLoad = function() {
  const movieData = window.readMovieDataFromImdbPage(document);

  browser.runtime.sendMessage(movieData)
      .then((response) => {
        window.injectRottenScore(document,
            `${response.audienceScore}`,
            response.url);
        window.injectTomatoMeter(document,
            response.tomatoMeter, response.url, 0);
      });
};

document.body.onload = window.addRottenOnLoad;
