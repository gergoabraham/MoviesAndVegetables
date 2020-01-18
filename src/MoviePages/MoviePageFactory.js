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
   * @return {MoviePage} MoviePage
   */
  static create(moviePageType, document) {
    if (moviePageType == 'Imdb') {
      // eslint-disable-next-line no-undef
      return new ImdbPage(document);
    } else if (moviePageType == 'RottenTomatoes') {
      // eslint-disable-next-line no-undef
      return new RottenPage(document);
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
