/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class ContentScriptImdb {
  static async injectRottenTomatoesScores() {
    await ContentScript.injectScores('RottenTomatoes', 'Imdb');
  };
}

if (typeof module !== 'undefined') {
  module.exports = ContentScriptImdb;
} else {
  ContentScriptImdb.injectRottenTomatoesScores();
}
