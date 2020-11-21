/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const sinon = require('sinon');

describe('MoviePage', function () {
  context('abstract class', function () {
    it('throw error on instantiating parent class', function () {
      (function () {
        new MoviePage();
      }.should.throw(`Class MoviePages shouldn't be instantiated.`));
    });

    context('methods', function () {
      let unimplementedMoviePage;

      before(function () {
        class UnimplementedMoviePage extends MoviePage {}
        unimplementedMoviePage = new UnimplementedMoviePage(
          'doc',
          'https://url'
        );
      });

      it('throw error on unimplemented getMovieInfo', async function () {
        await unimplementedMoviePage
          .getMovieInfo()
          .should.be.rejectedWith(Error, 'Function not implemented');
      });

      it('throw error on unimplemented getMovieInfoWithRatings', async function () {
        await unimplementedMoviePage
          .getMovieInfoWithRatings()
          .should.be.rejectedWith(Error, 'Function not implemented');
      });

      it('throw error on unimplemented injectRatings', function () {
        (function () {
          unimplementedMoviePage.injectRatings();
        }.should.throw(`Function not implemented.`));
      });
    });
  });

  context('child classes', function () {
    class ChildMoviePage extends MoviePage {}

    it('store doc on instantiating', function () {
      const childMoviePage = new ChildMoviePage(
        'input document',
        'https://url'
      );

      childMoviePage._document.should.equal('input document');
    });

    it('shorten url on instantiating', function () {
      const childMoviePage = new ChildMoviePage(
        'input document',
        'https://page.com/m/movie_title?stuff=toRemove&also=this'
      );

      childMoviePage._url.should.equal('https://page.com/m/movie_title');
    });

    context('methods', function () {
      let implementedMoviePage;

      before(function () {
        class ImplementedMoviePage extends MoviePage {
          getMovieInfo() {}
          getMovieInfoWithRatings() {}
          injectRatings() {}
        }
        implementedMoviePage = new ImplementedMoviePage('doc', 'https://url');
      });

      it('be OK on implemented getMovieInfo', async function () {
        await implementedMoviePage.getMovieInfo();
      });

      it('be OK on implemented getMovieInfoWithRatings', async function () {
        await implementedMoviePage.getMovieInfoWithRatings();
      });

      it('be OK on implemented injectRatings', function () {
        implementedMoviePage.injectRatings();
      });
    });
  });

  context('utilities', function () {
    context('fetchTextContent', function () {
      beforeEach(function () {
        const fakeFetch = sinon.fake.resolves({
          text: async () => 'text content',
        });

        sinon.replace(global, 'fetch', fakeFetch);
      });

      it('fetches text content from the web the first time', async function () {
        const textContent = await MoviePage._fetchTextContent('url1');

        global.fetch.should.have.been.calledOnceWithExactly('url1');
        textContent.should.equal('text content');
      });

      it('stores fetched values in "cache"', async function () {
        await MoviePage._fetchTextContent('url2');
        await MoviePage._fetchTextContent('url3');

        MoviePage['url2'].should.equal('text content');
        MoviePage['url3'].should.equal('text content');
      });

      it('second time it returns the value from the cache', async function () {
        await MoviePage._fetchTextContent('url4');
        await MoviePage._fetchTextContent('url4');
        const textContent = await MoviePage._fetchTextContent('url4');

        global.fetch.should.have.been.calledOnceWithExactly('url4');
        textContent.should.equal('text content');
      });
    });
  });
});
