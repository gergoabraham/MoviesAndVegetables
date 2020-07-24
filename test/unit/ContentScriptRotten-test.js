/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

let injectImdbScoresOnRotten;

const {ContentScript} = require('../../src/ContentScript');
global.ContentScript = ContentScript;

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

describe('Content script on RottenTomatoes', function() {
  before(function() {
    ({injectImdbScoresOnRotten} = require('../../src/ContentScriptRotten'));
  });

  describe('injectImdbScoresOnRotten', function() {
    it('inject IMDb scores into the document', async function() {
      const dom = await JSDOM
          .fromFile('./test/unit/html/rottentomatoes.m.shawshank_redemption.html',
              {url: 'https://www.rottentomatoes.com/m/shawshank_redemption'});
      global.document = dom.window.document;

      // todo: move this into setup, when "require" won't execute scripts
      global.browser = {runtime:
        {sendMessage: global.BackgroundScript.getRemotePageData},
      };

      await injectImdbScoresOnRotten();

      document.getElementById('mv-imdb-scores').should.exist;
    });
  });
});
