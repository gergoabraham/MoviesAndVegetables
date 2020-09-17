/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class ContentScriptRottenTomatoes {
  static async injectImdbScores() {
    await ContentScript.injectScores('Imdb', 'RottenTomatoes');
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ContentScriptRottenTomatoes);
} else {
  ContentScriptRottenTomatoes.injectImdbScores();
}
