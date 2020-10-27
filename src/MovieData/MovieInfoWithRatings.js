/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class MovieInfoWithRatings {
  /**
   * @param  {MovieInfo} info
   * @param  {string} url
   * @param  {string} pageName
   * @param  {number} toplistPosition
   * @param {Ratings} criticRatings
   * @param {Ratings} userRatings
   */
  constructor(
    info,
    url,
    pageName,
    toplistPosition,
    criticRatings,
    userRatings
  ) {
    this.info = info;
    this.url = url;
    this.pageName = pageName;
    this.toplistPosition = toplistPosition;
    this.criticRatings = criticRatings;
    this.userRatings = userRatings;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MovieInfoWithRatings);
}
