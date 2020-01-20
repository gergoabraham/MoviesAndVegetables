/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class MoviePageFactory {
  constructor() {
    throw new Error(`Class MoviePagesFactory shouldn't be instantiated.`);
  }

  /**
   * @param {string} moviePageType
   * @param {document} document
   * @param {string} url
   * @return {MoviePage} MoviePage
   */
  static create(moviePageType, document, url) {
    if (moviePageType == 'Imdb') {
      return new ImdbPage(document, url);
    } else if (moviePageType == 'RottenTomatoes') {
      return new RottenPage(document, url);
    } else {
      throw new Error(`MoviePagesFactory cannot instantiate ` +
                      `"${moviePageType}"`);
    }
  }
};

// Exporting class for unit tests. No effect in browser.
if (typeof module !== 'undefined') {
  module.exports = {MoviePageFactory};
}
