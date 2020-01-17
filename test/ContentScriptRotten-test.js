/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

// Functions under test
let addImdbOnLoad;

describe('Content script on RottenTomatoes', function() {
  before(function() {
    global.document = {};
    global.browser = {runtime: {sendMessage: sinon.fake.resolves({})}};
    ({addImdbOnLoad} = require('../src/ContentScriptRotten'));
  });

  describe('addImdbOnLoad', function() {
    it('todo', async function() {
      addImdbOnLoad();
    });
  });
});
