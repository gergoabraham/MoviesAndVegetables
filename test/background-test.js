'use strict';

// Functions under test
let constructSearchUrlForRotten;
let getRottenData;
let getRottenPage;

describe('Background script', function() {
  before('reading in script under test', function() {
    global.browser = {runtime: {onMessage: {addListener: sinon.spy()}}};
    require('../src/backgroundScript');
    ({constructSearchUrlForRotten, getRottenData, getRottenPage} = window);
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
        director: 'Frank Darabont',
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
        director: 'David Lowery',
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
});
