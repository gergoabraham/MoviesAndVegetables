/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

window.readRottenData = function(rottenPage, url) {
  const rottenScores =
      rottenPage.body.querySelectorAll('span.mop-ratings-wrap__percentage');

  const tomatoMeter = rottenScores[0].innerHTML.replace(/[^0-9]/g, '');
  const audienceScore = rottenScores[1].innerHTML.replace(/[^0-9]/g, '');

  const numberOfCriticRatingsHTML = rottenPage.body
      .querySelectorAll('small.mop-ratings-wrap__text--small')[0];
  const numberOfCriticRatings =
    numberOfCriticRatingsHTML.textContent.replace(/[^0-9]/g, '');

  const numberOfUserRatingsHtml = rottenPage.body
      .querySelectorAll('strong.mop-ratings-wrap__text--small')[1];
  const numberOfUserRatings =
    numberOfUserRatingsHtml.textContent.replace(/[^0-9]/g, '');

  return {tomatoMeter: tomatoMeter,
    tomatoMeterCount: numberOfCriticRatings,
    audienceScore: audienceScore,
    audienceScoreCount: numberOfUserRatings};
};
