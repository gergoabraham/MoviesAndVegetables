'use strict';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const fs = require('fs');

let document;

// Code under test
require('../src/addRottenToImdb');

// Functions under test
const {readMovieDataFromImdbPage, injectRottenScore} = window;

describe('When on a movie\'s imdb page', function() {
  beforeEach(function() {
    const testImdbPage = fs.readFileSync('./test/testImdbPage.html');
    const dom = new JSDOM(testImdbPage);
    document = dom.window.document;
  });

  describe('readMovieDataFromImdbPage', function() {
    it('should read movie title', function() {
      const movieData = readMovieDataFromImdbPage(document);
      movieData['title'].should.deep.equal('The Shawshank Redemption');
    });

    it('should read movie\'s release year', function() {
      const movieData = readMovieDataFromImdbPage(document);
      movieData['year'].should.deep.equal('1994');
    });

    it('should read director\'s name', function() {
      const movieData = readMovieDataFromImdbPage(document);
      movieData['director'].should.deep.equal('Frank Darabont');
    });
  });

  describe('injectRottenScore', function() {
    it('should add one child to rating-wrapper', function() {
      const ratingsWrapper =
        document.getElementById('star-rating-widget').parentNode;
      ratingsWrapper.childElementCount.should.equal(2);

      injectRottenScore(document);

      ratingsWrapper.childElementCount.should.equal(3);
    });

    it('should child\'s id be movies-and-vegetables-rotten-rating', function() {
      const ratingsWrapper =
        document.getElementById('star-rating-widget').parentNode;

      injectRottenScore(document);

      const moviesAndVegetables =
        document.getElementById('movies-and-vegetables-rotten-rating');

      should.exist(moviesAndVegetables);
      moviesAndVegetables.parentNode.parentNode.should.equal(ratingsWrapper);
    });

    it('should add given percent', function() {
      injectRottenScore(document, 93);

      document.getElementById('movies-and-vegetables-rotten-rating').
          innerHTML.should.equal('🍅93%');
    });
  });
});


