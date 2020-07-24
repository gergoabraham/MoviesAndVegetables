/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class ContentScriptRottenTomatoes {
  static async injectImdbScores() {
    await ContentScript.injectScores('Imdb', 'RottenTomatoes');
  };
}

if (typeof module !== 'undefined') {
  module.exports = {ContentScriptRottenTomatoes};
} else {
  ContentScriptRottenTomatoes.injectImdbScores();
}
