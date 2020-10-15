/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class MovieData {
  /**
   * @param  {string} title
   * @param  {number} year
   * @param  {string} url
   * @param  {number} toplistPosition
   * @param {Ratings} criticRatings
   * @param {Ratings} userRatings
   */
  constructor(title, year, url, toplistPosition, criticRatings, userRatings) {
    this.title = title;
    this.year = year;
    this.url = url;
    this.toplistPosition = toplistPosition;
    this.criticRatings = criticRatings;
    this.userRatings = userRatings;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MovieData);
}
