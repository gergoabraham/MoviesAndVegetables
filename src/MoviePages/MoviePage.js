/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

/* eslint-disable valid-jsdoc */
'use strict';

class MoviePage {
  /**
   * @param  {Document} document
   */
  constructor(document) {
    if (this.constructor === MoviePage) {
      throw new Error(`Class MoviePages shouldn't be instantiated.`);
    }

    this.document = document;
  }
  /**
   * @return {MovieData}
   */
  getMovieData() {
    throw new Error(`Function not implemented.`);
  }

  /**
   * @param  {MovieData} movieData
   */
  injectRatings(movieData) {
    throw new Error(`Function not implemented.`);
  }
};

// Exporting class for unit tests. No effect in browser.
if (typeof module !== 'undefined') {
  module.exports = {MoviePage};
}
