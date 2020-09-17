/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const contract = require('../tools/ContractTestDescription');


contract('RottenContract', function(fetchDOM) {
  context('structure', function() {
    let ratingContainer;

    before('getting ratings container', async function() {
      const document = await fetchDOM('https://www.rottentomatoes.com/m/shawshank_redemption');
      ratingContainer = document
          .querySelectorAll('section.mop-ratings-wrap__row.js-scoreboard-container')[0];
    });

    it('there is a container for ratings', async function() {
      ratingContainer.should.exist;
    });

    it('it has 2 children', function() {
      ratingContainer.children.length.should.equal(2);
    });

    context('tomatometer', function() {
      it('is the first child', function() {
        ratingContainer.children[0].getAttribute('class')
            .should.equal('mop-ratings-wrap__half');
      });

      it('contains a percentage', function() {
        ratingContainer.children[0]
            .getElementsByClassName('mop-ratings-wrap__percentage')[0]
            .should.exist;
      });
    });

    context('tomatometer', function() {
      it('second child is audience score', function() {
        ratingContainer.children[1].getAttribute('class')
            .should.equal('mop-ratings-wrap__half audience-score');
      });

      it('contains a percentage', function() {
        ratingContainer.children[1]
            .getElementsByClassName('mop-ratings-wrap__percentage')[0]
            .should.exist;
      });
    });
  });

  context('data', function() {
    let document;
    before(async function() {
      document = await fetchDOM('https://www.rottentomatoes.com/m/shawshank_redemption');
    });

    it('title', async function() {
      document.body.querySelectorAll('h1.mop-ratings-wrap__title.mop-ratings-wrap__title--top')[0].innerHTML
          .should.equal('The Shawshank Redemption');
    });

    it('release year', async function() {
      document.head
          .querySelector('meta[property="og:title"')
          .getAttribute('content')
          .match(/\d{4}/)[0]
          .should.equal('1994');
    });

    context('tomatometer', function() {
      it('value is a number', async function() {
        const tomatoMeter = document
            .getElementsByClassName('mop-ratings-wrap__percentage')[0].innerHTML;

        Number(tomatoMeter.match(/\d+(?=%)/)).should.be
            .above(80).and.most(100);
      });

      it('count is a number', async function() {
        const voteCount = document
            .querySelectorAll('small.mop-ratings-wrap__text--small')[0].innerHTML;

        Number(voteCount.match(/\d+/)).should.be
            .above(60).and.below(100);
      });
    });

    context('audience score', function() {
      it('value is a number', async function() {
        const audienceScore = document
            .getElementsByClassName('mop-ratings-wrap__percentage')[1].innerHTML;

        Number(audienceScore.match(/\d+(?=%)/)).should.be
            .above(80).and.most(100);
      });

      it('count is a number', async function() {
        const ratingsNumber = document
            .querySelectorAll('strong.mop-ratings-wrap__text--small')[1].innerHTML;

        Number(ratingsNumber.replace(/[^\d]/g, '')).should.be
            .above(880000).and.most(2000000);
      });
    });
  });
});
