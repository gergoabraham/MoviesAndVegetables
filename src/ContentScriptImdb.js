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

  browser.runtime.sendMessage({movieData, remotePageName: 'RottenTomatoes'})
      .then((response) => {
        imdbPage.injectRatings(response);
      });
};

document.body.onload = addRottenOnLoad;

if (typeof module !== 'undefined') {
  module.exports = {addRottenOnLoad};
}
