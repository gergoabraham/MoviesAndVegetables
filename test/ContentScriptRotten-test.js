/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

let injectImdbScoresOnRotten;

const {ContentScript} = require('../src/ContentScript');
global.ContentScript = ContentScript;

describe('Content script on RottenTomatoes', function() {
  before(function() {
    global.document = {};
    global.browser = {runtime: {sendMessage: sinon.fake.resolves({})}};
    sinon.replace(ContentScript, 'injectScores', sinon.fake());

    ({injectImdbScoresOnRotten} = require('../src/ContentScriptRotten'));
  });

  it('should immediately run its function', function() {
    ContentScript.injectScores.should.have.been.calledOnce;
  });

  describe('injectImdbScoresOnRotten', function() {
    it('should call the common "injectScores" function', async function() {
      sinon.replace(ContentScript, 'injectScores', sinon.fake());

      injectImdbScoresOnRotten();

      ContentScript.injectScores
          .should.have.been.calledOnceWithExactly('Imdb', 'RottenTomatoes');
    });
  });
});
