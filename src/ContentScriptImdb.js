/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class ContentScriptImdb {
  static async injectRottenTomatoesRatings() {
    await ContentScript.injectRatings(RottenPage.NAME, ImdbPage.NAME);
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ContentScriptImdb);
} else {
  ContentScriptImdb.injectRottenTomatoesRatings();
}
