/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

async function injectRottenScoresOnImdb() {
  await ContentScript.injectScores('RottenTomatoes', 'Imdb');
};

document.body.onload = injectRottenScoresOnImdb;

if (typeof module !== 'undefined') {
  module.exports = {injectRottenScoresOnImdb};
}
