/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class Ratings {
  /**
   * @param  {number} score
   * @param  {number} count
   * @param  {string} custom
   * @param  {boolean} isBanded
   */
  constructor(score, count, custom, isBanded = false) {
    this.score = score;
    this.count = count;
    this.custom = custom;
    this.isBanded = isBanded;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(Ratings);
}
