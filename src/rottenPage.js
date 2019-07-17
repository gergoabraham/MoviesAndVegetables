'use strict';

window.readRottenData = function(rottenPage, url) {
  const rottenScores =
      rottenPage.body.querySelectorAll('span.mop-ratings-wrap__percentage');

  const tomatoMeter = rottenScores[0].innerHTML.replace(/[^0-9]/g, '');
  const audienceScore = rottenScores[1].innerHTML.replace(/[^0-9]/g, '');

  return {tomatoMeter: tomatoMeter,
    audienceScore: audienceScore,
    url: url};
};
