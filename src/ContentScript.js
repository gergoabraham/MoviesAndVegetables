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
  static async injectRatings(remotePageName, currentPageName) {
    const currentPage = MoviePageFactory.create(
      currentPageName,
      document,
      document.baseURI
    );

    const movie = await currentPage.getMovieData();

    const response = await browser.runtime.sendMessage({
      movie,
      remotePageName,
    });
    currentPage.injectRatings(response);
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ContentScript);
}
