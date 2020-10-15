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
   * @param {MovieRating} criticsScore
   * @param {MovieRating} userScore
   */
  constructor(title, year, url, toplistPosition, criticsScore, userScore) {
    this.title = title;
    this.year = year;
    this.url = url;
    this.toplistPosition = toplistPosition;
    this.criticsScore = criticsScore;
    this.userScore = userScore;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MovieData);
}
