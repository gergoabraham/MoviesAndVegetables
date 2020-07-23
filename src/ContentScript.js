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

    const response = await browser.runtime.
        sendMessage({movieData, remotePageName});
    currentPage.injectRatings(response);
  }
}

if (typeof module !== 'undefined') {
  module.exports = {ContentScript};
}
