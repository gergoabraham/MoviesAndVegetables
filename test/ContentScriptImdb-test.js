/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

let injectRottenScoresOnImdb;

const {ContentScript} = require('../src/ContentScript');
global.ContentScript = ContentScript;

describe('Content script on IMDb', function() {
  before(function() {
    global.document = {body: {onload: {}}};
    ({injectRottenScoresOnImdb} = require('../src/ContentScriptImdb'));
  });

  it('should register its function on page loaded event', function() {
    global.document.body.onload.should.contain(injectRottenScoresOnImdb);
  });

  describe('injectRottenScoresOnImdb', function() {
    it('should call the common "injectScores" function', function() {
      sinon.replace(ContentScript, 'injectScores', sinon.fake());

      injectRottenScoresOnImdb();

      ContentScript.injectScores
          .should.have.been.calledOnceWithExactly('RottenTomatoes', 'Imdb');
    });
  });
});
