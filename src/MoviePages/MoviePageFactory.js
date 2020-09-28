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
    if (moviePageType == ImdbPage.NAME) {
      return new ImdbPage(document, url);
    } else if (moviePageType == RottenPage.NAME) {
      return new RottenPage(document, url);
    } else {
      throw new Error(
        `MoviePagesFactory cannot instantiate ` + `"${moviePageType}"`
      );
    }
  }

  static getMoviePageUrlPattern(moviePageType) {
    if (moviePageType == ImdbPage.NAME) {
      return ImdbPage.URL_PATTERN;
    } else if (moviePageType == RottenPage.NAME) {
      return RottenPage.URL_PATTERN;
    } else {
      return null;
    }
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MoviePageFactory);
}
