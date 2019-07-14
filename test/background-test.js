'use strict';

// Functions under test
let getRottenData;
let fetchRottenResponse;
let constructSearchUrlForRotten;
let getRottenPage;

describe('Background script', function() {
  before('reading in script under test', function() {
    global.browser = {runtime: {onMessage: {addListener: sinon.spy()}}};
    require('../src/backgroundScript');
    ({constructSearchUrlForRotten,
      getRottenData,
      getRottenPage,
      fetchRottenResponse} = window);
  });

  it('should register message listener on startup', function() {
    global.browser.runtime.onMessage.addListener
        .should.have.been.calledOnceWith(getRottenData);
  });

  describe('search-url constructor', function() {
    it('should construct search url for movie', function() {
      const movieData = {
        title: 'The Shawshank Redemption',
        year: '1994',
      };

      constructSearchUrlForRotten(movieData)
          .should.equal('https://www.google.com/search?btnI=true' +
              '&q=The+Shawshank+Redemption+1994+movie' +
              '+Rotten+Tomatoes');
    });

    it('should remove "&" character from movie title', function() {
      const movieData = {
        title: 'The Old Man & The Gun',
        year: '2018',
      };

      constructSearchUrlForRotten(movieData)
          .should.equal('https://www.google.com/search?btnI=true' +
              '&q=The+Old+Man++The+Gun+2018+movie' +
              '+Rotten+Tomatoes');
    });
  });

  describe('getRottenPage', function() {
    it('should parse the Response object for the webpage', async function() {
      const response = {
        text: sinon.fake.resolves('Text content from Response'),
      };
      const parseFromString = sinon.fake.returns('HTML document');
      global.DOMParser = sinon.fake.returns({parseFromString});

      const rottenPage = await getRottenPage(response);

      parseFromString.should.have.been
          .calledOnceWith('Text content from Response', 'text/html');
      rottenPage.should.equal('HTML document');
    });
  });

  describe('fetchRottenResponse', function() {
    it('should fetch Response object of movie data search', async function() {
      sinon.replace(window, 'constructSearchUrlForRotten',
          sinon.fake.returns('the search URL'));
      global.fetch = sinon.fake.resolves('the response object');

      const resp = await fetchRottenResponse('movieData');

      resp.should.equal('the response object');
      window.constructSearchUrlForRotten
          .should.have.been.calledOnceWith('movieData');
      global.fetch.should.have.been.calledOnceWith('the search URL');

      sinon.restore();
    });
  });
});
