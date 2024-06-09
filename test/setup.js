/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

/* ------------ Setting up assert library ------------ */
const chai = require('chai');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
should = chai.should();

/* ------------ Setting up fakes ------------ */
const { JSDOM } = require('jsdom');

global.DOMParser = new JSDOM().window.DOMParser;

require('./tools/FetchCache').activateAsGlobalFetch();

/* ------------ Global constants  ------------ */
global.FakeHtmlPath = './test/tools/fake-htmls/';

/* ------------ Importing production code  ------------ */
/* Production code doesn't export itself with `module.exports`, but uses this
 * `exportToTestEnvironment()` global function. Therefore the classes will be
 * usable by each other, and visible globally by intellisense.
 */
global.exportToTestEnvironment = function (productionCode) {
  global[productionCode.name] = productionCode;
};

require('../src/Utilities/Logger');
require('../src/ContentScriptImdb');
require('../src/ContentScriptRotten');
require('../src/ContentScript');
require('../src/BackgroundScript');
require('../src/Assets/rottenTomatoesIcons');
require('../src/MovieData/MovieInfo');
require('../src/MovieData/Ratings');
require('../src/MovieData/Summary');
require('../src/MovieData/MovieInfoWithRatings');
require('../src/MoviePages/MoviePage');
require('../src/MoviePages/ImdbPage');
require('../src/MoviePages/RottenPage');
require('../src/MoviePages/MoviePageFactory');

/* ------------ Test hooks for cleanup ------------ */
before(function () {
  setupGlobals();
});

afterEach(() => {
  require('sinon').restore();
  setupGlobals();
});

function setupGlobals() {
  global.window = {};
  window.navigator = { language: 'en' };

  global.browser = {
    runtime: {
      sendMessage: BackgroundScript._getRemotePageData,
      id: 'addon-id',
    },
  };
}
