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
 * for *fake* and *real* html/text documents, therefore every test needs to be
 * written only once.
 *
 * In order to get the *fake* and *real* html/text documents (from the *fake*
 * folder and from the *web*), the `async fetchDOM(url)` and the
 * `async fetchText(url)` can be used. These callback functions are passed to
 * the `body` as a parameter.
 *
 * ˙fetchDOM(url)` caches the document objects, so they **must not be changed**!
 *
 * @param {string} title Contract test title.
 * @param {contractCallback} body The test body. Use it like this:
 * `function(fetchDOM, fetchText) {...const document = await fetchDOM(url);...}`
 */
function contract(title, body) {
  describe(title, contractTestPerformer(body));
}

/**
 * Exclusive testing: only contract tests with '.only' will be performed.
 *
 * @param {string} title Contract test title.
 * @param {contractCallback} body The test body.
 */
contract.only = function (title, body) {
  describe.only(title, contractTestPerformer(body));
};

/**
 * Ignore this contract test.
 *
 * @param {string} title Contract test title.
 * @param {contractCallback} body The test body.
 */
contract.skip = function (title, body) {
  describe.skip(title, contractTestPerformer(body));
};

let documentCache = {};

after(function () {
  /* Letting the GC know that the cache object can be deleted,
     by unreferencing it in an explicit way.
     Without this, the contract test tdd script crashes after twenty-so runs,
     due to an oversized (>2GB) heap. */
  documentCache = null;
});

function contractTestPerformer(body) {
  return () => {
    context('--- REAL ---', () =>
      body(getFetcher('real', 'dom'), getFetcher('real', 'text'))
    );
    context('--- FAKE ---', () =>
      body(getFetcher('fake', 'dom'), getFetcher('fake', 'text'))
    );
  };
}

function getFetcher(realOrFake, textOrDom) {
  const htmlFetcher = createHtmlFetcher(realOrFake);

  return async (url) => {
    const key = realOrFake + url + textOrDom;

    if (documentCache[key] === undefined) {
      const response = await htmlFetcher.fetch(url);
      const text = await response.text();

      const result =
        textOrDom == 'dom' ? new JSDOM(text).window.document : text;

      documentCache[key] = result;
    }

    return documentCache[key];
  };
}

function createHtmlFetcher(type) {
  if (type == 'real') {
    return new RealHtmlFetcher();
  } else if (type == 'fake') {
    return FakeHtmlFetcher;
  }
}

module.exports = contract;

/** Type definition for the contract body.
 * @callback contractCallback
 * @param {(url:string)=>Promise<document>} fetchDOM
 * @param {(url:string)=>Promise<string>} fetchText
 * @return {void}
 */
