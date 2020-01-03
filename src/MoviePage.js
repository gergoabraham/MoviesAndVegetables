/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class MoviePage {
  constructor() {
    this.remoteName = 'Rotten Tomatoes';
  }
};

// Exporting class for unit tests. No effect in browser.
if (typeof module !== 'undefined') {
  module.exports = {MoviePage};
}
