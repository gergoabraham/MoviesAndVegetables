/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

describe('MoviePageFactory', function () {
  it('cannot be instantiated', function () {
    (function () {
      new MoviePageFactory();
    }.should.throw(`Class MoviePagesFactory shouldn't be instantiated.`));
  });

  context('create', function () {
    it('throw error on unexpected type', function () {
      (function () {
        MoviePageFactory.create('Cheese');
      }.should.throw(`MoviePagesFactory cannot instantiate "Cheese"`));
    });

    it('create ImdbPage', function () {
      const imdbPage = MoviePageFactory.create(
        ImdbPage.NAME,
        'doc',
        'https://url'
      );

      (imdbPage instanceof ImdbPage).should.be.true;
      (imdbPage instanceof MoviePage).should.be.true;

      (imdbPage instanceof RottenPage).should.be.false;

      imdbPage._document.should.equal('doc');
      imdbPage._url.should.equal('https://url/');
    });

    it('create RottenPage', function () {
      const rottenPage = MoviePageFactory.create(
        RottenPage.NAME,
        'doc',
        'https://url.two'
      );

      (rottenPage instanceof RottenPage).should.be.true;
      (rottenPage instanceof MoviePage).should.be.true;

      (rottenPage instanceof ImdbPage).should.be.false;

      rottenPage._document.should.equal('doc');
      rottenPage._url.should.equal('https://url.two/');
    });
  });
});
