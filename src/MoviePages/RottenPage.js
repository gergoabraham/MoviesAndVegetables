/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class RottenPage extends MoviePage {
  /**
   * @return  {MovieData} movieData
   */
  getMovieData() {
    const rottenScores = this.document.body
        .querySelectorAll('span.mop-ratings-wrap__percentage');

    const tomatoMeter = rottenScores[0].innerHTML.replace(/[^0-9]/g, '');
    const audienceScore = rottenScores[1].innerHTML.replace(/[^0-9]/g, '');

    const numberOfCriticRatingsHTML = this.document.body
        .querySelectorAll('small.mop-ratings-wrap__text--small')[0];
    const numberOfCriticRatings = numberOfCriticRatingsHTML
        .textContent.replace(/[^0-9]/g, '');

    const numberOfUserRatingsHtml = this.document.body
        .querySelectorAll('strong.mop-ratings-wrap__text--small')[1];
    const numberOfUserRatings =
      numberOfUserRatingsHtml.textContent.replace(/[^0-9]/g, '');

    const title = this.document.body
        .querySelectorAll(
            'h1.mop-ratings-wrap__title.mop-ratings-wrap__title--top')[0]
        .innerHTML;

    const year = this.document.body
        .querySelectorAll('ul.content-meta.info')[0]
        .querySelectorAll('time')[0]
        .getAttribute('datetime')
        .substring(0, 4);

    const url = new URL(this.document.baseURI);

    return new MovieData(
        title, Number(year), url.origin + url.pathname,
        Number(audienceScore), Number(numberOfUserRatings),
        Number(tomatoMeter), Number(numberOfCriticRatings),
    );
  }
}

if (typeof module !== 'undefined') {
  module.exports = {RottenPage};
}
