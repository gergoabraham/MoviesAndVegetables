/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class ContentScriptRottenTomatoes {
  static async injectImdbRatings() {
    await ContentScript.injectRatings(ImdbPage.NAME, RottenPage.NAME);
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ContentScriptRottenTomatoes);
} else {
  ContentScriptRottenTomatoes.injectImdbRatings();
}
