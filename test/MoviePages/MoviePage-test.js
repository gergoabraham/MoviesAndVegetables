/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const {MoviePage} = require('../../src/MoviePages/MoviePage');

describe('MoviePage', function() {
  it('should throw error on instantiate', function() {
    (function() {
      new MoviePage();
    }).should.throw(`Class MoviePages shouldn't be instantiated.`);
  });

  context('abstract methods', function() {
    context('unimplemented methods', function() {
      let unimplementedMoviePage;

      before(function() {
        class UnimplementedMoviePage extends MoviePage {};
        unimplementedMoviePage = new UnimplementedMoviePage();
      });

      it('should throw error on unimplemented readMovieData', function() {
        (function() {
          unimplementedMoviePage.readMovieData();
        }).should.throw(`Function not implemented.`);
      });

      it('should throw error on unimplemented injectRatings', function() {
        (function() {
          unimplementedMoviePage.injectRatings();
        }).should.throw(`Function not implemented.`);
      });
    });

    context('implemented methods', function() {
      let implementedMoviePage;

      before(function() {
        class ImplementedMoviePage extends MoviePage {
          readMovieData() {};
          injectRatings() {};
        };
        implementedMoviePage = new ImplementedMoviePage();
      });

      it('should be OK on implemented readMovieData', function() {
        implementedMoviePage.readMovieData();
      });

      it('should be OK on implemented injectRatings', function() {
        implementedMoviePage.injectRatings();
      });
    });
  });
});
