/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

function injectImdbScoresOnRotten() {
  ContentScript.injectScores('Imdb', 'RottenTomatoes');
};

injectImdbScoresOnRotten();

if (typeof module !== 'undefined') {
  module.exports = {injectImdbScoresOnRotten};
}
