const path = require('path');
const sinonChai = require('sinon-chai');
const chai = require('chai');
chai.use(sinonChai);

const webExtensionsJSDOM = require('webextensions-jsdom');
const manifestPath = path.resolve(path.join(__dirname, '../src/manifest.json'));

describe('Movies and Vegetables', () => {
  let webExtension;
  beforeEach(async () => {
    webExtension = await webExtensionsJSDOM
        .fromManifest(manifestPath, {apiFake: true, wiring: true});
  });

  describe('Started', () => {
    it('should do nothing', async () => {
    });
  });

  afterEach(async () => {
    await webExtension.destroy();
  });
});
