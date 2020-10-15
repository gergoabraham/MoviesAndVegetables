/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class MovieRating {
  /**
   * @param  {number} score
   * @param  {number} count
   * @param  {string} custom
   */
  constructor(score, count, custom) {
    this.score = score;
    this.count = count;
    this.custom = custom;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MovieRating);
}
