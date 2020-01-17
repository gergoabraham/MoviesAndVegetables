/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

// eslint-disable-next-line no-undef
class RottenPage extends MoviePage {
  getMovieData() {
    const rottenScores =
    this.document.body.querySelectorAll('span.mop-ratings-wrap__percentage');

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

    return {tomatoMeter: tomatoMeter,
      tomatoMeterCount: numberOfCriticRatings,
      audienceScore: audienceScore,
      audienceScoreCount: numberOfUserRatings};
  }
}

if (typeof module !== 'undefined') {
  module.exports = {RottenPage};
}
