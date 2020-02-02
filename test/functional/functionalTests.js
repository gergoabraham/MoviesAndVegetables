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

  after(async function() {
    driver.quit();
  });
});
