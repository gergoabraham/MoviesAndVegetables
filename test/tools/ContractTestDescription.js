/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const RealHtmlFetcher = require('../tools/RealHtmlFetcher');

/** Type definition for the contract body.
 * @callback contractCallback
 * @param {(url:string)=>Promise<document>} fetchDOM
 * @return {void}
 */

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
  describe(title, function() {
    context('--- FAKE ---', () => body(getDOMFetcher(FakeHtmlFetcher)));
    context('--- REAL ---', () => body(getDOMFetcher(new RealHtmlFetcher())));
  });
}

function getDOMFetcher(htmlFetcher) {
  return async (url) => {
    const response = await htmlFetcher.fetch(url);
    const text = await response.text();
    return new JSDOM(text).window.document;
  };
}

module.exports = contract;
