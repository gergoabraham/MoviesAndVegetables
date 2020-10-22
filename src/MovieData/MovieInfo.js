/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class MovieInfo {
  /**
   * @param  {string} title
   * @param  {number} year
   */
  constructor(title, year) {
    this.title = title;
    this.year = year;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MovieInfo);
}
