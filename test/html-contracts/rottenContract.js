/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const contract = require('../tools/ContractTestDescription');

contract('RottenContract', function (fetchDOM, fetchText) {
  context('structure', function () {
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

        context('tomatometer', function () {
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

  context('data', function () {
    let document;

    function getAudienceScoreCountElement(document) {
      return document
        .getElementsByClassName('mop-ratings-wrap__half')[1]
        .querySelectorAll('strong.mop-ratings-wrap__text--small')[0];
    }

    function getTomatometerElement(document) {
      return document
        .getElementsByClassName('mop-ratings-wrap__half')[0]
        .getElementsByClassName('mop-ratings-wrap__percentage')[0];
    }

    function getTomatometerCountElement(document) {
      return document.body
        .getElementsByClassName('mop-ratings-wrap__half')[0]
        .querySelectorAll('small.mop-ratings-wrap__text--small')[0];
    }

    function getAudienceScoreElement(document) {
      return document
        .getElementsByClassName('mop-ratings-wrap__half')[1]
        .getElementsByClassName('mop-ratings-wrap__percentage')[0];
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

    function getCriticsConsensusElement(document) {
      return document.querySelector(
        'section.mop-ratings-wrap__row.js-scoreboard-container'
      ).previousElementSibling;
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

    context('tomatometer', function () {
      it('value is a number', async function () {
        const tomatoMeter = getTomatometerElement(document).innerHTML;

        Number(tomatoMeter.match(/\d+(?=%)/))
          .should.be.above(80)
          .and.most(100);
      });

      it('freshness is in the class name', function () {
        const freshnessIcon = document.querySelector(
          'span.mop-ratings-wrap__icon.meter-tomato'
        );

        freshnessIcon.className.should
          .include(' icon big ')
          .and.include(' certified-fresh');
      });

      it('count is a number', async function () {
        const tomatometerCount = getTomatometerCountElement(document).innerHTML;

        Number(tomatometerCount.match(/\d+/))
          .should.be.above(60)
          .and.below(100);
      });
    });

    context('audience score', function () {
      it('value is a number', async function () {
        const audienceScore = getAudienceScoreElement(document).textContent;

        Number(audienceScore.match(/\d+(?=%)/))
          .should.be.above(80)
          .and.most(100);
      });

      it('popcorn freshness is in the class name', function () {
        const freshnessIcon = document.querySelectorAll(
          'span.mop-ratings-wrap__icon.meter-tomato'
        )[1];

        freshnessIcon.className.should
          .include(' icon big ')
          .and.include(' upright');
      });

      it('count is a number', async function () {
        const audienceScoreCount = getAudienceScoreCountElement(document)
          .textContent;

        Number(audienceScoreCount.replace(/[^\d]/g, ''))
          .should.be.above(880000)
          .and.most(2000000);
      });
    });

    context('missing scores', function () {
      let document;

      before(`let's check some unimportant data`, async function () {
        document = await fetchDOM('https://www.rottentomatoes.com/m/avatar_5');

        readMetadata(document).name.should.equal('Avatar 5');
        readReleaseYear(document).should.equal('2028');
      });

      it(`tomatometer doesn't exist`, function () {
        should.not.exist(getTomatometerElement(document));
      });

      it(`tomatometer count contains N/A`, function () {
        getTomatometerCountElement(document).textContent.should.contain('N/A');
      });

      it(`audience score doesn't exist`, function () {
        should.not.exist(getAudienceScoreElement(document));
      });

      it(`audience score count contains "Not yet available"`, function () {
        getAudienceScoreCountElement(document).textContent.should.contain(
          'Not yet available'
        );
      });
    });

    context('missing tomatomer, but existing audience score', function () {
      let document;

      before(`let's check some unimportant data`, async function () {
        document = await fetchDOM('https://www.rottentomatoes.com/m/amblin');

        readMetadata(document).name.should.equal("Amblin'");
        readReleaseYear(document).should.equal('1968');
      });

      it(`tomatometer doesn't exist`, function () {
        should.not.exist(getTomatometerElement(document));
      });

      it(`tomatometer count contains N/A`, function () {
        getTomatometerCountElement(document).textContent.should.contain('N/A');
      });

      it(`audience score exists`, function () {
        const audienceScore = getAudienceScoreElement(document).innerHTML;

        Number(audienceScore.match(/\d+(?=%)/))
          .should.be.above(20)
          .and.most(100);
      });

      it(`audience score count exists`, function () {
        const audienceScoreCount = getAudienceScoreCountElement(document)
          .innerHTML;

        Number(audienceScoreCount.replace(/[^\d]/g, ''))
          .should.be.above(10)
          .and.most(2000);
      });
    });

    context('critics consensus', function () {
      it('is a nice description when exists', async function () {
        const document = await fetchDOM(
          'https://www.rottentomatoes.com/m/shawshank_redemption'
        );

        getCriticsConsensusElement(document).innerHTML.should.contain(
          '<em>The Shawshank Redemption</em> is an uplifting'
        );
      });

      it('or it says "No consensus yet."', async function () {
        const document = await fetchDOM(
          'https://www.rottentomatoes.com/m/amblin'
        );

        getCriticsConsensusElement(document).textContent.should.equal(
          'No consensus yet.'
        );
      });
    });
  });

  context('style', function () {
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
