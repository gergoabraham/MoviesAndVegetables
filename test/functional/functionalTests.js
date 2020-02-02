/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const {Builder, By, until} = require('selenium-webdriver');

describe('Functional tests', async function() {
  let driver;

  before(async function() {
    driver = new Builder().forBrowser('firefox').build();
    await driver.manage().setTimeouts({pageLoad: 5000});
    await driver.installAddon('web-ext-artifacts/movies_and_vegetables-0.2.0.zip', true);
  });

  context('on IMDb', function() {
    before(async function() {
      await driver.get('https://www.imdb.com/title/tt6751668/');
    });

    it('should inject audience score', async function() {
      await driver.wait(until.elementLocated(By.id('audience-score')), 10000);
      const audienceScore = (await driver).findElement(By.id('audience-score'));

      audienceScore.should.exist;
    });

    it('should inject Tomatometer', async function() {
      await driver.wait(
          until.elementLocated(By.className('titleReviewBarItem TomatoMeter')),
          10000);

      const tomatoMeter = await driver
          .findElement(By.className('titleReviewBarItem TomatoMeter'));

      tomatoMeter.should.exist;
    });
  });

  context('on RottenTomatoes', function() {
    before(async function() {
      driver.get('https://www.rottentomatoes.com/m/the_dark_knight')
          .catch((err) => {}); // it is loaded more than the 5 seconds timeout
    });

    it('should inject IMDb scores', async function() {
      await driver.wait(until.elementLocated(By.id('IMDb scores')), 10000);
      const imdbScores = await driver.findElement(By.id('IMDb scores'));

      imdbScores.should.exist;
    });
  });

  after(async function() {
    driver.quit();
  });
});
