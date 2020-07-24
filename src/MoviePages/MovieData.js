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
   * @param  {number} userRating
   * @param  {number} numberOfUserVotes
   * @param  {number} criticsRating
   * @param  {number} numberOfCriticsVotes
   * @param  {number} toplistPosition
   */
  constructor(title, year, url,
      userRating, numberOfUserVotes,
      criticsRating, numberOfCriticsVotes,
      toplistPosition) {
    this.title = title;
    this.year = year;
    this.url = url;
    this.userRating = userRating;
    this.numberOfUserVotes = numberOfUserVotes;
    this.criticsRating = criticsRating;
    this.numberOfCriticsVotes = numberOfCriticsVotes;
    this.toplistPosition = toplistPosition;
  }
}

// Exporting class for unit tests. No effect in browser.
if (typeof module !== 'undefined') {
  module.exports = MovieData;
}
