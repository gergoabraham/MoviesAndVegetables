'use strict';

const { expect } = require('chai');

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

  exp.info.should.deep.equal(act.info, '👉 wrong `info` 👈\n');
  exp.url.should.equal(act.url, '👉 wrong `url` 👈\n');
  exp.pageName.should.equal(act.pageName, '👉 wrong `pageName` 👈\n');
  expect(exp.toplistPosition).to.equal(
    act.toplistPosition,
    '👉 wrong `toplistPosition` 👈\n'
  );

  if (exp.summary === null) {
    expect(act.summary, '👉 wrong `summary` 👈\n').to.be.null;
  } else {
    exp.summary.should.deep.equal(act.summary, '👉 wrong `summary` 👈\n');
  }

  compareRatings(exp.criticRatings, act.criticRatings, 'criticRatings');
  compareRatings(exp.userRatings, act.userRatings, 'userRatings');
}

/**
 *
 * @param {Ratings} exp
 * @param {Ratings} act
 * @param {type} string
 */
function compareRatings(exp, act, type) {
  if (exp === act) {
    return;
  }

  expect(act.count, `👉 \`${type}.count\` is missing 👈\n`).to.not.be.null;
  act.count.should.be.greaterThanOrEqual(
    exp.count,
    `👉 wrong \`${type}.count\` 👈\n`
  );

  expect(act.score, `👉 \`${type}.score\` is missing 👈\n`).to.not.be.null;
  act.score.should.be.closeTo(
    exp.score,
    act.score * 0.1,
    `👉 wrong \`${type}.score\` 👈\n`
  );

  expect(act.custom, `👉 \`${type}.custom\` is missing 👈\n`).to.not.be.null;
  act.custom.should.equal(exp.custom, `👉 wrong \`${type}.custom\` 👈\n`);

  act.isBanded.should.equal(exp.isBanded, `👉 wrong \`${type}.isBanded\` 👈\n`);
}

module.exports = { shouldBeSimilar };
