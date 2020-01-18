/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class ContentScript {
  /**
   * @param {string} remotePageName
   * @param {string} currentPageName
   */
  static injectScores(remotePageName, currentPageName) {
    const currentPage = MoviePageFactory.create(currentPageName, document);
    const movieData = currentPage.getMovieData();

    browser.runtime.sendMessage({movieData, remotePageName})
        .then((response) => {
          currentPage.injectRatings(response);
        });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {ContentScript};
}
