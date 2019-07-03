
const jsdom = require('jsdom');
const {JSDOM} = jsdom; // eslint-disable-line no-unused-vars

describe('Dummy tests', function() {
  describe('Add', function() {
    it('should add two numbers', async function() {
      add(2, 3).should.equal(5);
    });
  });

  describe('Sub', function() {
    it('should subtract one number from the other', async function() {
      sub(2, 3).should.equal(-1);
    });
  });
});

describe('injectRottenScore', function() {
  beforeEach(function() {
    const dom = new JSDOM(`
    <!DOCTYPE html>
    <div class="ratings_wrapper">
        <div class="imdbRating" itemtype="http://schema.org/AggregateRating" itemscope="" itemprop="aggregateRating">
            <div class="ratingValue">
                <strong title="9,3 based on 2 108 741 user ratings">
                    <span itemprop="ratingValue">9,3</span>
                </strong>
                <span class="grey">/</span>
                <span class="grey" itemprop="bestRating">10</span>
            </div>
            <a href="/title/tt0111161/ratings?ref_=tt_ov_rt">
                <span class="small" itemprop="ratingCount">2 108 741</span>
            </a>
            <div class="hiddenImportant">
                <span itemprop="reviewCount">6 605 user</span>
                <span itemprop="reviewCount">217 critic</span>
            </div>
        </div>

        <div id="star-rating-widget" class="star-rating-widget">
            <div class="star-rating-button">
                <button>
                    <span class="star-rating-star no-rating"/>
                    <span class="star-rating-text">Rate This</span>
                </button>
            </div>
        </div>
    </div>
    `);
    doc = dom.window.document;
  });

  it('should add one child to rating-wrapper', function() {
    const ratingsWrapper = doc.getElementById('star-rating-widget').parentNode;
    ratingsWrapper.childElementCount.should.equal(2);

    injectRottenScore(doc);

    ratingsWrapper.childElementCount.should.equal(3);
  });

  // todo: some tests are still needed
});
