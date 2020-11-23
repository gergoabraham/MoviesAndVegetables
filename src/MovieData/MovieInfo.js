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
   * @param  {string} director
   */
  constructor(title, year, director) {
    this.title = title;
    this.year = year;
    this.director = director;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MovieInfo);
}
