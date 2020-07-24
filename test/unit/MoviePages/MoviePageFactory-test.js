/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const {MoviePage} = require('../../../src/MoviePages/MoviePage');
global.MoviePage = MoviePage;
const {RottenPage} = require('../../../src/MoviePages/RottenPage');
global.RottenPage = RottenPage;
const {MoviePageFactory} = require('../../../src/MoviePages/MoviePageFactory');

let ImdbPage;

describe('MoviePageFactory', function() {
  before(function() {
    // todo: all require should be in before functions
    ({ImdbPage} = require('../../../src/MoviePages/ImdbPage'));
    global.ImdbPage = ImdbPage;
  });

  it('cannot be instantiated', function() {
    (function() {
      new MoviePageFactory();
    }).should.throw(`Class MoviePagesFactory shouldn't be instantiated.`);
  });

  context('create', function() {
    it('throw error on unexpected type', function() {
      (function() {
        MoviePageFactory.create('Cheese');
      }).should.throw(`MoviePagesFactory cannot instantiate "Cheese"`);
    });

    it('create ImdbPage', function() {
      const imdbPage = MoviePageFactory.create('Imdb', 'doc', 'https://url');

      (imdbPage instanceof ImdbPage).should.be.true;
      (imdbPage instanceof MoviePage).should.be.true;

      (imdbPage instanceof RottenPage).should.be.false;

      imdbPage.document.should.equal('doc');
      imdbPage.url.should.equal('https://url/');
    });

    it('create RottenPage', function() {
      const rottenPage = MoviePageFactory
          .create('RottenTomatoes', 'doc', 'https://url.two');

      (rottenPage instanceof RottenPage).should.be.true;
      (rottenPage instanceof MoviePage).should.be.true;

      (rottenPage instanceof ImdbPage).should.be.false;

      rottenPage.document.should.equal('doc');
      rottenPage.url.should.equal('https://url.two/');
    });
  });
});
