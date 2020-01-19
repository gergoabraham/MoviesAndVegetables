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
  static async injectScores(remotePageName, currentPageName) {
    const currentPage = MoviePageFactory
        .create(currentPageName, document, document.baseURI);

    const movieData = await currentPage.getMovieData();

    browser.runtime.sendMessage({movieData, remotePageName})
        .then((response) => {
          currentPage.injectRatings(response);
        });
  }
}

if (typeof module !== 'undefined') {
  module.exports = {ContentScript};
}
