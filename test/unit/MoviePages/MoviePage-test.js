/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const {MoviePage} = require('../../../src/MoviePages/MoviePage');

describe('MoviePage', function() {
  context('abstract class', function() {
    it('throw error on instantiating parent class', function() {
      (function() {
        new MoviePage();
      }).should.throw(`Class MoviePages shouldn't be instantiated.`);
    });

    context('methods', function() {
      let unimplementedMoviePage;

      before(function() {
        class UnimplementedMoviePage extends MoviePage {};
        unimplementedMoviePage = new UnimplementedMoviePage('doc', 'https://url');
      });

      it('throw error on unimplemented getMovieData', async function() {
        await unimplementedMoviePage.getMovieData()
            .should.be.rejectedWith(Error);
      });

      it('throw error on unimplemented injectRatings', function() {
        (function() {
          unimplementedMoviePage.injectRatings();
        }).should.throw(`Function not implemented.`);
      });
    });
  });

  context('child classes', function() {
    class ChildMoviePage extends MoviePage {};

    it('store doc on instantiating', function() {
      const childMoviePage = new ChildMoviePage('input document', 'https://url');
      childMoviePage.document.should.equal('input document');
    });

    it('shorten url on instantiating', function() {
      const childMoviePage = new ChildMoviePage('input document',
          'https://page.com/m/movie_title?stuff=toRemove&also=this');

      childMoviePage.url.should.equal('https://page.com/m/movie_title');
    });

    context('methods', function() {
      let implementedMoviePage;

      before(function() {
        class ImplementedMoviePage extends MoviePage {
          getMovieData() {};
          injectRatings() {};
        };
        implementedMoviePage = new ImplementedMoviePage('doc', 'https://url');
      });

      it('be OK on implemented getMovieData', function() {
        implementedMoviePage.getMovieData();
      });

      it('be OK on implemented injectRatings', function() {
        implementedMoviePage.injectRatings();
      });
    });
  });
});
