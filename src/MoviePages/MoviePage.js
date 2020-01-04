/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class MoviePage {
  constructor() {
    if (this.constructor === MoviePage) {
      throw new Error(`Class MoviePages shouldn't be instantiated.`);
    }
  }

  readMovieData() {
    // todo: create type (class) for moviedata
    throw new Error(`Function not implemented.`);
  }

  injectRatings() {
    throw new Error(`Function not implemented.`);
  }
};

// Exporting class for unit tests. No effect in browser.
if (typeof module !== 'undefined') {
  module.exports = {MoviePage};
}
