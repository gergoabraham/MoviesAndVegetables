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
   * @param  {number} userRating
   * @param  {number} numberOfUserVotes
   * @param  {number} criticsRating
   * @param  {number} numberOfCriticsVotes
   */
  constructor(title, year,
      userRating, numberOfUserVotes,
      criticsRating, numberOfCriticsVotes) {
    this.title = title;
    this.year = year;
    this.userRating = userRating;
    this.numberOfUserVotes = numberOfUserVotes;
    this.criticsRating = criticsRating;
    this.numberOfCriticsVotes = numberOfCriticsVotes;
  }
}

// Exporting class for unit tests. No effect in browser.
if (typeof module !== 'undefined') {
  module.exports = {MovieData};
}
