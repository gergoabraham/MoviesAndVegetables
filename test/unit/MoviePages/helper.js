'use strict';

/**
 *
 * @param {MovieInfoWithRatings} exp
 * @param {MovieInfoWithRatings} act
 * @returns
 */
function shouldBeSimilar(exp, act) {
  if (
    exp.constructor !== MovieInfoWithRatings ||
    act.constructor !== MovieInfoWithRatings
  ) {
    throw new Error('shouldBeSimilar: received type not supported');
  }

  exp.info.should.deep.equal(act.info);
  exp.url.should.equal(act.url);
  exp.pageName.should.equal(act.pageName);
  (exp.toplistPosition === act.toplistPosition).should.be.true;

  exp.summary === act.summary || exp.summary.should.deep.equal(act.summary);
  compareRatings(exp.criticRatings, act.criticRatings);
  compareRatings(exp.userRatings, act.userRatings);
}

/**
 *
 * @param {Ratings} exp
 * @param {Ratings} act
 */
function compareRatings(exp, act) {
  if (exp === act) {
    return;
  }

  act.custom.match(exp.custom).should.not.be.null;
  act.count.should.be.greaterThanOrEqual(exp.count);
  act.score.should.be.closeTo(exp.score, act.score * 0.1);
}

module.exports = { shouldBeSimilar };
