/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

async function injectImdbScoresOnRotten() {
  await ContentScript.injectScores('Imdb', 'RottenTomatoes');
};

if (typeof module !== 'undefined') {
  module.exports = {injectImdbScoresOnRotten};
} else {
  injectImdbScoresOnRotten();
}
