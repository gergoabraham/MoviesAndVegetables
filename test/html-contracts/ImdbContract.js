/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const contract = require('../tools/ContractTestDescription');

contract.skip('ImdbContract', function (fetchDOM, fetchText) {
  context('structure', function () {
    context('user score - ratings wrapper', async function () {
      context('full version', function () {
        let ratingsWrapper;
        let document;

        before(async function () {
          document = await fetchDOM('https://www.imdb.com/title/tt0111161/');
          ratingsWrapper =
            document.getElementsByClassName('ratings_wrapper')[0];
        });

        it('ratings_wrapper exists', function () {
          ratingsWrapper.should.exist;
        });

        it("ratings_wrapper is title_bar_wrapper's first child", function () {
          ratingsWrapper.should.equal(
            document.getElementsByClassName('title_bar_wrapper')[0].children[0]
          );
        });

        context('imdbRating', function () {
          it('is the first child', function () {
            ratingsWrapper.children[0].className.should.equal('imdbRating');
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
        });
      });

      context('no user score yet', function () {
        let document;
        let titleBarWrapper;

        before(async function () {
          document = await fetchDOM('https://www.imdb.com/title/tt1630029/');
          titleBarWrapper =
            document.getElementsByClassName('title_bar_wrapper')[0];
        });

        it('title_bar_wrapper exists', function () {
          titleBarWrapper.should.exist;
        });

        it("it doesn't contain ratings_wrapper", function () {
          should.not.exist(
            titleBarWrapper.getElementsByClassName('ratings_wrapper')[0]
          );
        });
      });
    });

    context('critic ratings - titleReviewBar', function () {
      context('full version', function () {
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
          titleReviewBar.children[0].className.should.equal(
            'titleReviewBarItem'
          );
        });

        it('the first child contains the metascore', async function () {
          titleReviewBar.children[0].getElementsByClassName(
            'metacriticScore'
          )[0].should.exist;
        });

        it('its second child is a divider', async function () {
          titleReviewBar.children[1].className.should.equal('divider');
        });
      });

      context('metascore is missing', function () {
        let titleReviewBar;

        before(async function () {
          const document = await fetchDOM(
            'https://www.imdb.com/title/tt0064010/'
          );

          titleReviewBar = document.getElementsByClassName('titleReviewBar')[0];
        });

        it('titleReviewBar exists', async function () {
          titleReviewBar.should.exist;
        });

        it("titleReviewBar's parent is plotSummaryWrapper", function () {
          titleReviewBar.parentElement.className.should.contain(
            'plot_summary_wrapper'
          );
        });

        it('its first child is a titleReviewBarItem', async function () {
          titleReviewBar.children[0].className.should.contain(
            'titleReviewBarItem'
          );
        });

        it('the first child is NOT metascore', async function () {
          should.not.exist(
            titleReviewBar.children[0].getElementsByClassName(
              'metacriticScore'
            )[0]
          );
        });

        it('there are no other items', async function () {
          titleReviewBar.children.length.should.equal(1);
        });
      });

      context.skip('there is no titleReviewBar', function () {
        let document;

        before(async function () {
          document = await fetchDOM('https://www.imdb.com/title/tt1630029/');
        });

        // todo: find a movie that doesn't have a titleReviewBar
        it("titleReviewBar doesn't exist", async function () {
          should.not.exist(
            document.getElementsByClassName('titleReviewBar')[0]
          );
        });
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

        metadata = readMetadata(document);
      });

      it('type is "movie"', function () {
        metadata['@type'].should.equal('Movie');
      });

      it('title is in the json', function () {
        metadata.name.should.equal('The Shawshank Redemption');
      });

      it('director is an object (for one director)', function () {
        metadata.director.name.should.equal('Frank Darabont');
      });
    });

    context('release year', function () {
      it('is in a meta tag', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );

        document.head
          .querySelector('meta[property="og:title"')
          .content.match(/\d{4}/)[0]
          .should.equal('1994');
      });
    });

    context('series metadata', function () {
      it('type is "TVSeries"', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0149460/'
        );
        const metadata = readMetadata(document);

        metadata['@type'].should.equal('TVSeries');
      });
    });

    context('user rating', function () {
      let document;

      before(async function () {
        document = await fetchDOM('https://www.imdb.com/title/tt0111161/');
      });

      it('value is a number', async function () {
        const rating = document.querySelector(
          'span[itemprop="ratingValue"'
        ).innerHTML;
        const valueWithoutGroupingCharacters = rating.replace(/,|&nbsp;/g, '');

        isNaN(valueWithoutGroupingCharacters).should.be.false;
        Number(valueWithoutGroupingCharacters)
          .should.be.above(9.0)
          .and.most(10.0);
      });

      it('count is a number', async function () {
        const rating = document.querySelector(
          'span[itemprop="ratingCount"'
        ).innerHTML;
        const valueWithoutGroupingCharacters = rating.replace(/,|&nbsp;/g, '');

        isNaN(valueWithoutGroupingCharacters).should.be.false;
        Number(valueWithoutGroupingCharacters)
          .should.be.above(2222000)
          .and.below(3000000);
      });
    });

    context('imdb logo', function () {
      it('is an svg', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );

        const logo = document.getElementById('home_img');

        logo.tagName.should.equal('svg');
      });
    });

    context('metascore', function () {
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

      it('critic favorableness is in the class list', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );
        const metacritic = document.querySelector('div.metacriticScore');

        metacritic.className.match(/score_\w+/).length.should.equal(1);
      });

      it('count is a number in the critics page', async function () {
        const criticsPage = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/criticreviews'
        );
        const count = criticsPage.querySelector(
          'span[itemprop="ratingCount"'
        ).textContent;

        isNaN(count).should.equal(false);
        Number(count).should.be.above(10).and.below(200);
      });
    });

    context('top250 position', function () {
      it('hides in an anchor', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );
        const toplistPositionElement = document.querySelector(
          'a[href="/chart/top?ref_=tt_awd"'
        ).textContent;

        toplistPositionElement.should.match(/Top Rated Movies #1/);
      });

      it('or it is not there', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt1630029/'
        );

        should.not.exist(
          document.querySelector('a[href="/chart/top?ref_=tt_awd"')
        );
      });
    });

    context('plot summary', function () {
      it('is there', async function () {
        const document = await fetchDOM(
          'https://www.imdb.com/title/tt0111161/'
        );

        document.querySelectorAll('div.summary_text').length.should.equal(1);
        document
          .querySelector('div.summary_text')
          .innerHTML.trim()
          .should.match(/^Two imprisoned men.+$/);
      });
    });

    context('missing scores', function () {
      let document;

      before(`let's check some unimportant data`, async function () {
        document = await fetchDOM('https://www.imdb.com/title/tt1630029/');

        const metadata = readMetadata(document);

        metadata['@type'].should.equal('Movie');
        metadata.name.should.equal('Avatar 2');
        document.head
          .querySelector('meta[property="og:title"')
          .content.match(/\d{4}/)[0]
          .should.equal('2022');
      });

      it(`user score doesn't exist`, function () {
        should.not.exist(document.querySelector('span[itemprop="ratingValue"'));
      });

      it(`user score count doesn't exist`, function () {
        should.not.exist(document.querySelector('span[itemprop="ratingCount"'));
      });

      it(`metascore doesn't exist`, function () {
        should.not.exist(document.querySelector('div.metacriticScore'));
      });
    });
  });

  context('style', function () {
    let matchedStyleSheets;

    before('get URL for latest stylesheet', async function () {
      const document = await fetchDOM('https://www.imdb.com/title/tt0111161/');

      const stylesheetLinkElements = document.querySelectorAll('link');
      const styleSheetLinks = Array.from(stylesheetLinkElements).map(
        (linkElement) => linkElement.href
      );

      matchedStyleSheets = styleSheetLinks.filter((link) =>
        link.match(/\/S\/.*\.css$/)
      );
    });

    context('link', function () {
      it('html contains the needed "**/S/**/*.css" stylesheet link', async function () {
        matchedStyleSheets.length.should.be.above(0);
      });

      it('as an absolute link', function () {
        matchedStyleSheets[0].match(/^https:\/\/.+$/).should.exist;
      });
    });

    context('css', function () {
      let css;

      before(async function () {
        css = await fetchText(matchedStyleSheets[0]);
      });

      it('contains background color for .score_favorable', function () {
        css
          .match(/\.score_favorable{background-color:#[a-f0-9]{6}}/gi)
          .length.should.equal(1);
      });

      it('contains background color for .score_mixed', function () {
        css
          .match(/\.score_mixed{background-color:#[a-f0-9]{6}}/gi)
          .length.should.equal(1);
      });

      it('contains background color for .score_unfavorable', function () {
        css
          .match(/\.score_unfavorable{background-color:#[a-f0-9]{6}}/gi)
          .length.should.equal(1);
      });
    });
  });

  // TODO: different languages
});

function readMetadata(document) {
  const metadataRaw = document.head.querySelector(
    'script[type="application/ld+json"]'
  ).textContent;

  return JSON.parse(metadataRaw);
}
