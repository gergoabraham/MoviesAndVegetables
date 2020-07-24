/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

let injectRottenScoresOnImdb;

const {ContentScript} = require('../../src/ContentScript');
global.ContentScript = ContentScript;

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

describe('Content script on IMDb', function() {
  before(function() {
    global.document = {body: {onload: {}}};
    ({injectRottenScoresOnImdb} = require('../../src/ContentScriptImdb'));
  });

  it('register its function on page loaded event', function() {
    global.document.body.onload.should.contain(injectRottenScoresOnImdb);
  });

  describe('injectRottenScoresOnImdb', function() {
    it('inject RottenTomatoes scores into the document', async function() {
      const dom = await JSDOM
          .fromFile('./test/unit/html/imdb.title.tt0111161 - listed in top250.html',
              {url: 'https://www.imdb.com/title/tt0111161/'});
      global.document = dom.window.document;

      // todo: move this into setup, when "require" won't execute scripts
      global.browser = {runtime:
        {sendMessage: global.BackgroundScript.getRemotePageData},
      };

      await injectRottenScoresOnImdb();

      document.getElementById('mv-audience-score').should.exist;
      document.getElementById('mv-tomatometer').should.exist;
    });
  });
});
