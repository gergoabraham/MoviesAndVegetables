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
   * @param  {string} userRatingLogo
   * @param  {string} criticsRatingColor
   */
  constructor(
    title,
    year,
    url,
    userRating,
    numberOfUserVotes,
    criticsRating,
    numberOfCriticsVotes,
    toplistPosition,
    userRatingLogo,
    criticsRatingColor
  ) {
    this.title = title;
    this.year = year;
    this.url = url;
    this.userRating = userRating;
    this.numberOfUserVotes = numberOfUserVotes;
    this.criticsRating = criticsRating;
    this.numberOfCriticsVotes = numberOfCriticsVotes;
    this.toplistPosition = toplistPosition;
    this.userRatingLogo = userRatingLogo;
    this.criticsRatingColor = criticsRatingColor;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MovieData);
}
