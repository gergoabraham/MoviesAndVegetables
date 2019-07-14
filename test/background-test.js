'use strict';

// Code under test
require('../src/backgroundScript');

// Functions under test
const {constructSearchUrlForRotten, getRottenData} = window;


describe('Background script', function() {
  describe('on startup', function() {
    it('should register message listener', function() {
      global.browser.runtime.onMessage.addedListener
          .should.equal(getRottenData);
    });
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

    it('should remove "&" character from url', function() {
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
});
