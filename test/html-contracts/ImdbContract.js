/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const contract = require('../tools/ContractTestDescription');

contract('ImdbContract', function (fetchDOM) {
  context('structure', function () {
    context('user score - ratings wrapper', async function () {
      let ratingsWrapper;
      before(async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );
        ratingsWrapper = document.getElementsByClassName('ratings_wrapper')[0];
      });

      it('ratings_wrapper exists', function () {
        ratingsWrapper.should.exist;
      });

      context('imdbRating', function () {
        it('is the first child', function () {
          ratingsWrapper.children[0]
            .getAttribute('class')
            .should.equal('imdbRating');
        });

        it('contains the ratingValue', function () {
          ratingsWrapper.children[0].querySelector(
            'span[itemprop="ratingValue"'
          ).should.exist;
        });

        it('contains the ratingCount', function () {
          ratingsWrapper.children[0].querySelector(
            'span[itemprop="ratingCount"'
          ).should.exist;
        });
      });

      context('star-rating-widget', function () {
        it('is the second child', function () {
          ratingsWrapper.children[1].id.should.equal('star-rating-widget');
        });

        it('has a button inside', function () {
          const starRatingWidget = ratingsWrapper.children[1];
          starRatingWidget.children[0].children[0].tagName.should.equal(
            'BUTTON'
          );
        });
      });
    });

    context('critics score - titleReviewBar', function () {
      let titleReviewBar;
      before(async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );
        titleReviewBar = document.getElementsByClassName('titleReviewBar')[0];
      });

      it('titleReviewBar exists', async function () {
        titleReviewBar.should.exist;
      });

      it('its first child is a titleReviewBarItem', async function () {
        titleReviewBar.children[0]
          .getAttribute('class')
          .should.equal('titleReviewBarItem');
      });

      it('the first child contains the metacriticScore', async function () {
        titleReviewBar.children[0].getElementsByClassName(
          'metacriticScore'
        )[0].should.exist;
      });

      it('its second child is a divider', async function () {
        titleReviewBar.children[1]
          .getAttribute('class')
          .should.equal('divider');
      });
    });
  });

  context('data', function () {
    context('movie metadata', function () {
      let metadata;

      before('reading json from the <head> section', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );
        const metadataRaw = document.head.querySelector(
          'script[type="application/ld+json"]'
        ).textContent;
        metadata = JSON.parse(metadataRaw);
      });

      it('type is "movie"', function () {
        metadata['@type'].should.equal('Movie');
      });

      it('title is in the json', function () {
        metadata.name.should.equal('The Shawshank Redemption');
      });

      it('release date is in the json', function () {
        metadata.datePublished.should.equal('1994-09-23');
      });
    });

    context('series metadata', function () {
      it('type is "TVSeries"', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0149460/'
        );
        const metadataRaw = document.head.querySelector(
          'script[type="application/ld+json"]'
        ).textContent;
        const metadata = JSON.parse(metadataRaw);

        metadata['@type'].should.equal('TVSeries');
      });
    });

    context('user rating', function () {
      let document;
      before(async function () {
        document = await fetchDOM('https://www.imdb.com/title/tt0111161/');
      });

      it('value is a number', async function () {
        const rating = document.querySelector('span[itemprop="ratingValue"')
          .innerHTML;
        const valueWithoutGroupingCharacters = rating.replace(/,|&nbsp;/g, '');

        isNaN(valueWithoutGroupingCharacters).should.be.false;
        Number(valueWithoutGroupingCharacters)
          .should.be.above(9.0)
          .and.most(10.0);
      });

      it('count is a number', async function () {
        const rating = document.querySelector('span[itemprop="ratingCount"')
          .innerHTML;
        const valueWithoutGroupingCharacters = rating.replace(/,|&nbsp;/g, '');

        isNaN(valueWithoutGroupingCharacters).should.be.false;
        Number(valueWithoutGroupingCharacters)
          .should.be.above(2222000)
          .and.below(3000000);
      });
    });

    context('critics rating', function () {
      it('value is a number', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );
        const metacritic = document
          .querySelector('div.metacriticScore')
          .querySelector('span').innerHTML;

        isNaN(metacritic).should.equal(false);
        Number(metacritic).should.be.above(50).and.most(100);
      });

      it('count is a number in the critics page', async function () {
        const criticsPage = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/criticreviews'
        );
        const count = criticsPage.querySelector('span[itemprop="ratingCount"')
          .textContent;

        isNaN(count).should.equal(false);
        Number(count).should.be.above(10).and.below(200);
      });
    });

    context('top250 position', function () {
      it('hides in a string', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );
        const awardDescription = document.getElementById('titleAwardsRanks')
          .textContent;

        awardDescription.should.match(/Top Rated Movies #\d/);
      });

      it('or it is not amongst the awards', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt7984734/'
        );
        const awardDescription = document.getElementById('titleAwardsRanks')
          .textContent;

        awardDescription.should.not.match(/Top Rated Movies #\d/);
      });

      it.skip('or there is no titleAwardsRanks', function () {});
    });
  });

  // TODO: different languages
});
