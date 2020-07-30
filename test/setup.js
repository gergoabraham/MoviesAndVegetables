/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

/* Third party tools */
global.sinon = require('sinon');
const chai = require('chai');
should = chai.should();
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
global.fs = require('fs');
global.JSDOM = require('jsdom')['JSDOM'];

/* Global constants */
global.FakeHtmlPath = './test/tools/fake-htmls/';

/* In-house tools */
global.FakeHtmlFetcher = require('./tools/FakeHtmlFetcher');
global.contract = require('./tools/ContractTestDescription');

/* Production code */
global.ContentScriptImdb = require('../src/ContentScriptImdb');
global.ContentScriptRottenTomatoes = require('../src/ContentScriptRotten');
global.ContentScript = require('../src/ContentScript');
global.BackgroundScript = require('../src/BackgroundScript');
global.MovieData = require('../src/MoviePages/MovieData');
global.MoviePage = require('../src/MoviePages/MoviePage');
global.ImdbPage = require('../src/MoviePages/ImdbPage');
global.RottenPage = require('../src/MoviePages/RottenPage');
global.MoviePageFactory = require('../src/MoviePages/MoviePageFactory');

function setupGlobals() {
  global.window = {};
  window.navigator = {};
  global.browser = {runtime:
    {sendMessage: global.BackgroundScript.getRemotePageData},
  };
}

before(function() {
  setupGlobals();
});

beforeEach(() => {
  global.DOMParser = new JSDOM().window.DOMParser;
  FakeHtmlFetcher.activateAsGlobalFetch();
});

afterEach(() => {
  sinon.restore();
  setupGlobals();
});
