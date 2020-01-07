/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const {MoviePage} = require('../../src/MoviePages/MoviePage');

describe('MoviePage', function() {
  context('abstract class', function() {
    it('should throw error on instantiating parent class', function() {
      (function() {
        new MoviePage();
      }).should.throw(`Class MoviePages shouldn't be instantiated.`);
    });

    context('methods', function() {
      let unimplementedMoviePage;

      before(function() {
        class UnimplementedMoviePage extends MoviePage {};
        unimplementedMoviePage = new UnimplementedMoviePage();
      });

      it('should throw error on unimplemented getMovieData', function() {
        (function() {
          unimplementedMoviePage.getMovieData();
        }).should.throw(`Function not implemented.`);
      });

      it('should throw error on unimplemented injectRatings', function() {
        (function() {
          unimplementedMoviePage.injectRatings();
        }).should.throw(`Function not implemented.`);
      });
    });
  });

  context('child classes', function() {
    it('should store doc on instantiating child class', function() {
      class ChildMoviePage extends MoviePage {};
      const inputDocument = 'input document';
      const childMoviePage = new ChildMoviePage(inputDocument);

      childMoviePage.document.should.equal(inputDocument);
    });

    context('methods', function() {
      let implementedMoviePage;

      before(function() {
        class ImplementedMoviePage extends MoviePage {
          getMovieData() {};
          injectRatings() {};
        };
        implementedMoviePage = new ImplementedMoviePage();
      });

      it('should be OK on implemented getMovieData', function() {
        implementedMoviePage.getMovieData();
      });

      it('should be OK on implemented injectRatings', function() {
        implementedMoviePage.injectRatings();
      });
    });
  });
});
