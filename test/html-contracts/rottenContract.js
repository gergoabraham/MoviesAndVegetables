/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const contract = require('../tools/ContractTestDescription');

contract('RottenContract', function (fetchDOM, fetchText) {
  context.skip('structure', function () {
    it('there is a ratings-wrap__info', async function () {
      const document = await fetchDOM(
        'https://www.rottentomatoes.com/m/shawshank_redemption'
      );

      document
        .querySelectorAll('section.mop-ratings-wrap__info')
        .length.should.equal(1);
    });

    context('ratings-wrap__info', function () {
      let ratingsWrapInfo;

      before('getting ratings-wrap__info', async function () {
        const document = await fetchDOM(
          'https://www.rottentomatoes.com/m/shawshank_redemption'
        );

        ratingsWrapInfo = document.querySelectorAll(
          'section.mop-ratings-wrap__info'
        )[0];
      });

      it('the first child is Critics Consensus title', function () {
        ratingsWrapInfo.children[0].tagName.should.equal('STRONG');
        ratingsWrapInfo.children[0].textContent.should.equal(
          'Critics Consensus'
        );
      });

      it('the second child is the Critics Consensus', function () {
        ratingsWrapInfo.children[1].tagName.should.equal('P');
        ratingsWrapInfo.children[1].classList.contains(
          'mop-ratings-wrap__text'
        ).should.be.true;
        ratingsWrapInfo.children[1].classList.contains(
          'mop-ratings-wrap__text--concensus'
        ).should.be.true;
      });

      it('the third child is the ratings container', function () {
        ratingsWrapInfo.children[2].tagName.should.equal('SECTION');
        ratingsWrapInfo.children[2].className.should.equal(
          'mop-ratings-wrap__row js-scoreboard-container'
        );
      });

      context('ratings container', function () {
        let ratingContainer;

        before('getting ratings container', async function () {
          const document = await fetchDOM(
            'https://www.rottentomatoes.com/m/shawshank_redemption'
          );

          ratingContainer = document.querySelector(
            'section.mop-ratings-wrap__row.js-scoreboard-container'
          );
        });

        it('there is a container for ratings', async function () {
          ratingContainer.should.exist;
        });

        it('it has 2 children', function () {
          ratingContainer.children.length.should.equal(2);
        });

        context('tomatometer', function () {
          it('is the first child', function () {
            ratingContainer.children[0].className.should.equal(
              'mop-ratings-wrap__half'
            );
          });

          it('contains a percentage', function () {
            ratingContainer.children[0].getElementsByClassName(
              'mop-ratings-wrap__percentage'
            )[0].should.exist;
          });
        });

        context('audience score', function () {
          it('second child is audience score', function () {
            ratingContainer.children[1].className.should.equal(
              'mop-ratings-wrap__half audience-score'
            );
          });

          it('contains a percentage', function () {
            ratingContainer.children[1].getElementsByClassName(
              'mop-ratings-wrap__percentage'
            )[0].should.exist;
          });
        });
      });
    });
  });

  context.skip('data', function () {
    let document;

    function getScoreInfo(document) {
      return JSON.parse(
        document.body.innerHTML.match(
          /RottenTomatoes\.context\.scoreInfo = ([^;]+\n?);/
        )[1]
      );
    }

    function readMetadata(document) {
      const metadataRaw = document.head.querySelector(
        'script[type="application/ld+json"]'
      ).textContent;

      return JSON.parse(metadataRaw);
    }

    function readReleaseYear(document) {
      return document.head
        .querySelector('meta[property="og:title"')
        .content.match(/\d{4}/)[0];
    }

    function getCriticsConsensus(document) {
      return document.body.innerHTML.match(
        /what-to-know__section-body">\n +<span>(.+)<\/span>/
      )?.[1];
    }

    before(async function () {
      document = await fetchDOM(
        'https://www.rottentomatoes.com/m/shawshank_redemption'
      );
    });

    it('title', async function () {
      readMetadata(document).name.should.equal('The Shawshank Redemption');
    });

    it('release year', async function () {
      readReleaseYear(document).should.equal('1994');
    });

    context('different release years', function () {
      let document;

      before(async function () {
        document = await fetchDOM('https://www.rottentomatoes.com/m/akira');
      });

      it('can be in the html title', async function () {
        readReleaseYear(document).should.match(/\d\d\d\d/);
      });

      it('can be in the movie info table as release date (theaters)', function () {
        document
          .querySelectorAll('li.meta-row .meta-value time')[0]
          .dateTime.should.contain(1988);
      });

      it('can be in the movie info table as release date (streaming)', function () {
        document
          .querySelectorAll('li.meta-row .meta-value time')[1]
          .dateTime.should.contain(2009);
      });

      it('runtime is there, too', function () {
        document
          .querySelectorAll('li.meta-row .meta-value time')[2]
          .dateTime.should.contain('P2h 4mM');
      });
    });

    it('director is an array', function () {
      readMetadata(document).director[0].name.should.equal('Frank Darabont');
    });

    context('tomatometer', function () {
      it('scoreboard contains tomatometer', async function () {
        Number(getScoreInfo(document).tomatometerAllCritics.score)
          .should.be.above(80)
          .and.most(100);
      });

      it('and the freshness state', function () {
        getScoreInfo(
          document
        ).tomatometerAllCritics.tomatometerState.should.equal(
          'certified-fresh'
        );
      });

      it('and the vote count', async function () {
        getScoreInfo(document)
          .tomatometerAllCritics.ratingCount.should.be.above(60)
          .and.most(100);
      });
    });

    context('audience score', function () {
      it('scoreboard contains audience score', async function () {
        Number(getScoreInfo(document).audienceAll.score)
          .should.be.above(80)
          .and.most(100);
      });

      it('and the freshness state', function () {
        getScoreInfo(document).audienceAll.audienceClass.should.equal(
          'upright'
        );
      });

      it('and the vote count', async function () {
        getScoreInfo(document)
          .audienceAll.ratingCount.should.be.above(880000)
          .and.most(2000000);
      });
    });

    context('missing scores', function () {
      let document;

      before(`let's check some unimportant data`, async function () {
        document = await fetchDOM('https://www.rottentomatoes.com/m/avatar_2');

        readMetadata(document).name.should.equal('Avatar 2');
        readReleaseYear(document).should.equal('2022');
      });

      it(`tomatometer doesn't exist`, function () {
        should.not.exist(getScoreInfo(document).tomatometerAllCritics.score);
      });

      it(`tomatometer count doesn't exist`, function () {
        should.not.exist(getScoreInfo(document).tomatometerAllCritics.count);
      });

      it(`audience score doesn't exist`, function () {
        should.not.exist(getScoreInfo(document).audienceAll.score);
      });

      it(`audience score count doesn't exist`, function () {
        should.not.exist(getScoreInfo(document).audienceAll.ratingCount);
      });
    });

    context('critics consensus', function () {
      it('is a nice description when exists', async function () {
        const document = await fetchDOM(
          'https://www.rottentomatoes.com/m/shawshank_redemption'
        );

        getCriticsConsensus(document).should.contain(
          '<em>The Shawshank Redemption</em> is an uplifting'
        );
      });

      it("or it doesn't exist", async function () {
        const document = await fetchDOM(
          'https://www.rottentomatoes.com/m/amblin'
        );

        should.not.exist(getCriticsConsensus(document));
      });
    });
  });

  context.skip('style', function () {
    let matchedStyleSheets;

    before('get URL for latest stylesheet', async function () {
      const document = await fetchDOM(
        'https://www.rottentomatoes.com/m/shawshank_redemption'
      );

      const stylesheetLinkElements = document.querySelectorAll('link');
      const styleSheetLinks = Array.from(stylesheetLinkElements).map(
        (linkElement) => linkElement.href
      );

      matchedStyleSheets = styleSheetLinks.filter((link) =>
        link.match(/global.*\.css$/)
      );
    });

    context('link', function () {
      it('html contains the needed "global" stylesheet link', async function () {
        matchedStyleSheets.length.should.equal(1);
      });

      it('as a relative link', function () {
        matchedStyleSheets[0].match(/^\/assets.+$/).should.exist;
      });
    });

    context('css', function () {
      let css;

      before(async function () {
        css = await fetchText(
          'https://www.rottentomatoes.com' + matchedStyleSheets[0]
        );
      });

      context('tomatometer', function () {
        it('contains relative svg link for .certified-fresh', function () {
          css
            .match(
              /\.icon\.big\.certified-fresh[^{]*{background:transparent url\(([^)]+)/
            )[1]
            .should.match(/^\/assets.+certified_fresh.*\.svg$/);
        });

        it('contains relative svg link for .fresh', function () {
          css
            .match(
              /\.icon\.big\.fresh[^{]*{background:transparent url\(([^)]+)/
            )[1]
            .should.match(/^\/assets.+fresh.*\.svg$/);
        });

        it('contains relative svg link for .rotten', function () {
          css
            .match(
              /\.icon\.big\.rotten[^{]*{background:transparent url\(([^)]+)/
            )[1]
            .should.match(/^\/assets.+rotten.*\.svg$/);
        });
      });

      context('audience score', function () {
        it('contains relative svg link for .upright', function () {
          css
            .match(
              /\.icon\.big\.upright[^{]*{background:transparent url\(([^)]+)/
            )[1]
            .should.match(/^\/assets.+aud_score-fresh.*\.svg$/);
        });

        it('contains relative svg link for .spilled', function () {
          css
            .match(
              /\.icon\.big\.spilled[^{]*{background:transparent url\(([^)]+)/
            )[1]
            .should.match(/^\/assets.+aud_score-rotten.*\.svg$/);
        });
      });
    });
  });
});
