/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const { JSDOM } = require('jsdom');
const RealHtmlFetcher = require('./RealHtmlFetcher');
const FakeHtmlFetcher = require('./FakeHtmlFetcher');

/**
 * Describe an **html contract test** suite. It runs the tests **twice**, both
 * for *fake* and *real* html documents, therefore every test needs to be
 * written only once.
 *
 * In order to get the *fake* and *real* html documents (from the *fake* folder
 * and from the *web*), the `async fetchDOM(url)` can be used. This callback
 * function is passed to the `body` as a parameter. It can be called multiple
 * times as it caches the documents. Therefore the document objects **must not
 * be changed**!
 *
 * @param {string} title Contract test title.
 * @param {contractCallback} body The test body. Use it like this:
 * `function(fetchDOM) {...const document = await fetchDOM(url);...}`
 */
function contract(title, body) {
  describe(title, contractTestPerformer(body));
}

/**
 * Exclusive testing: only contract tests with '.only' will be performed.
 *
 * @param {string} title Contract test title.
 * @param {contractCallback} body The test body. Use it like this:
 * `function(fetchDOM) {...const document = await fetchDOM(url);...}`
 */
contract.only = function (title, body) {
  describe.only(title, contractTestPerformer(body));
};

/**
 * Ignore this contract test.
 *
 * @param {string} title Contract test title.
 * @param {contractCallback} body The test body. Use it like this:
 * `function(fetchDOM) {...const document = await fetchDOM(url);...}`
 */
contract.skip = function (title, body) {
  describe.skip(title, contractTestPerformer(body));
};

const DOMcache = {};

function contractTestPerformer(body) {
  return () => {
    context('--- REAL ---', () => body(getDOMFetcher('real')));
    context('--- FAKE ---', () => body(getDOMFetcher('fake')));
  };
}

function getDOMFetcher(type) {
  const htmlFetcher = createHtmlFetcher(type);

  return async (url) => {
    const key = type + url;
    if (DOMcache[key] === undefined) {
      const upToDateDOM = await fetchUpToDateDOM(htmlFetcher, url);
      DOMcache[key] = upToDateDOM;
    }
    return DOMcache[key];
  };
}

function createHtmlFetcher(type) {
  if (type == 'real') {
    return new RealHtmlFetcher();
  } else if (type == 'fake') {
    return FakeHtmlFetcher;
  }
}

async function fetchUpToDateDOM(htmlFetcher, url) {
  const response = await htmlFetcher.fetch(url);
  const text = await response.text();
  const dom = new JSDOM(text).window.document;

  return dom;
}

module.exports = contract;

/** Type definition for the contract body.
 * @callback contractCallback
 * @param {(url:string)=>Promise<document>} fetchDOM
 * @return {void}
 */
