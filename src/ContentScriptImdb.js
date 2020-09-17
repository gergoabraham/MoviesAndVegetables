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

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ContentScriptImdb);
} else {
  ContentScriptImdb.injectRottenTomatoesScores();
}
