/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

// Functions under test
let getRemotePageData;
let fetchResponse;
let constructSearchUrl;
let getRemotePage;
let removeForwardWarning;

describe('Background script', function() {
  before('reading in script under test', function() {
    global.browser = {runtime: {onMessage: {addListener: sinon.spy()}}};
    require('../src/backgroundScript');
    ({constructSearchUrl,
      getRemotePageData,
      getRemotePage,
      fetchResponse,
      removeForwardWarning} = window);
  });

  it('should register message listener on startup', function() {
    global.browser.runtime.onMessage.addListener
        .should.have.been.calledOnceWithExactly(getRemotePageData);
  });

  describe('search-url constructor', function() {
    it('should construct search url for movie', function() {
      const movieData = {
        title: 'The Shawshank Redemption',
        year: '1994',
      };

      constructSearchUrl(movieData, `Rotten Tomatoes`)
          .should.equal('https://www.google.com/search?btnI=true' +
              '&q=The+Shawshank+Redemption+1994+movie' +
              '+Rotten+Tomatoes');
    });

    it('should remove "&" character from movie title', function() {
      const movieData = {
        title: 'The Old Man & The Gun',
        year: '2018',
      };

      constructSearchUrl(movieData, `Rotten Tomatoes`)
          .should.equal('https://www.google.com/search?btnI=true' +
              '&q=The+Old+Man++The+Gun+2018+movie' +
              '+Rotten+Tomatoes');
    });
  });

  describe('getRemotePage', function() {
    it('should parse the Response object for the webpage', async function() {
      const response = {
        text: sinon.fake.resolves('Text content from Response'),
      };
      const parseFromString = sinon.fake.resolves('HTML document');
      global.DOMParser = sinon.fake.returns({parseFromString});

      await getRemotePage(response).should.eventually.equal('HTML document');

      parseFromString.should.have.been
          .calledOnceWithExactly('Text content from Response', 'text/html');
    });
  });

  describe('fetchResponse', function() {
    it('should fetch Response object of movie data search', async function() {
      sinon.replace(window, 'constructSearchUrl',
          sinon.fake.returns('the search URL'));
      global.fetch = sinon.fake.resolves('the response object');

      await fetchResponse('movieData', 'Rotten Tomatoes')
          .should.eventually.equal('the response object');

      window.constructSearchUrl.should.have.been
          .calledOnceWithExactly('movieData', 'Rotten Tomatoes');
      global.fetch.should.have.been.calledOnceWithExactly('the search URL');

      sinon.restore();
    });
  });

  describe('skipForwardWarning', function() {
    it('should get movie url in order to skip forward warning', function() {
      removeForwardWarning(`https://www.google.com/url?q=https://www.rottentomatoes.com/m/the_dark_knight`)
          .should.equal(`https://www.rottentomatoes.com/m/the_dark_knight`);
    });
  });

  describe('getRemotePageData', function() {
    let document;

    before(async function() {
      const dom = await JSDOM.fromFile('./test/testRottenTomatoesPage.html',
          {url: `https://www.rottentomatoes.com/m/shawshank_redemption`});
      document = dom.window.document;
    });

    it(`should search Rotten page and return with the scores`,
        async function() {
          // Todo: this test works only because readRottenData is visible,
          // it shall be mocked.

          // Input -> searchURL
          const movieData = {
            title: 'The Shawshank Redemption',
            year: '1994',
          };

          // Fetch(searchURL) -> response -> 'responseURL'
          //                              -> 'textContent'
          global.fetch = sinon.fake.resolves({
            url: 'responseURL',
            text: sinon.fake.resolves('Text content from Response'),
          });

          // DOMParser() -> parser.parseFromString(textContent) -> testHTML file
          const parseFromString = sinon.fake.resolves(document);
          global.DOMParser = sinon.fake.returns({parseFromString});

          await getRemotePageData({movieData, remotePage: 'remote page name'})
              .should.eventually.deep.equal(
                  {
                    tomatoMeter: '91',
                    audienceScore: '98',
                    url: `responseURL`,
                    tomatoMeterCount: '68',
                    audienceScoreCount: '885203',
                  }
              );

          // Todo: fetch and removeForwardWarning is not tested correctly
          global.fetch
              .should.have.been.calledTwice;

          parseFromString
              .should.have.been.calledOnceWithExactly(
                  'Text content from Response', 'text/html');
        });
  });
});
