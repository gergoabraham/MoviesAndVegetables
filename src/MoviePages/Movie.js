/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class Movie {
  /**
   * @param  {MovieInfo} info
   * @param  {string} url
   * @param  {number} toplistPosition
   * @param {Ratings} criticRatings
   * @param {Ratings} userRatings
   */
  constructor(info, url, toplistPosition, criticRatings, userRatings) {
    this.info = info;
    this.url = url;
    this.toplistPosition = toplistPosition;
    this.criticRatings = criticRatings;
    this.userRatings = userRatings;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(Movie);
}
