/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const RealHtmlFetcher = require('./RealHtmlFetcher');

describe('RealHtmlFetcher', function() {
  let realHtmlFetcher;

  before(function() {
    realHtmlFetcher = new RealHtmlFetcher('test-cache');
    removeCacheFolder();
  });

  after(function() {
    removeCacheFolder();
  });

  it('fetch response should give back text/html', async function() {
    const response = await realHtmlFetcher.fetch('https://www.google.com/');
    const html = await response.text();

    html.should.contain('<!doctype html>');
  });

  context('cache', function() {
    let response;
    context('first call of fetch()', function() {
      it('don\'t store page in cache after fetch()', async function() {
        removeCacheFolder();

        response = await realHtmlFetcher.fetch('https://www.google.com');

        fs.existsSync(realHtmlFetcher.CachePath).should.be.false;
      });

      it('return with actual html', async function() {
        const html = await response.text();

        html.should.contain('<!doctype html>');
      });

      it('store html in cache', async function() {
        fs.existsSync(realHtmlFetcher.CachePath).should.be.true;
        fs.existsSync(realHtmlFetcher.CachePath + 'google.html').should.be.true;
      });

      it('second call of text() throws error', async function() {
        await response.text()
            .should.be.rejectedWith(TypeError, 'body used already');
      });
    });

    context('second call of fetch() for the same url', function() {
      it('text() returns with cached file', async function() {
        fs.appendFileSync(realHtmlFetcher.CachePath + 'google.html',
            '>>> cached file content <<<');

        response = await realHtmlFetcher.fetch('https://www.google.com');
        const html = await response.text();

        html.should.contain('<!doctype html>');
        html.should.contain('>>> cached file content <<<');
      });

      it('second call of text() throws error', async function() {
        await response.text()
            .should.be.rejectedWith(TypeError, 'body used already');
      });
    });
  });

  context('url handling', function() {
    it('fetch subpages and query parameters', async function() {
      const response = await realHtmlFetcher.fetch('https://www.google.com/search?q=dark+knight+2008');
      const html = await response.text();

      html.should.contain('Dark Knight');
    });

    it('load url with subpage/query parameter from cache', async function() {
      fs.appendFileSync(realHtmlFetcher.CachePath +
            'google.search...q=dark+knight+2008.html',
      '>>> cached file content for url with query parameter <<<');

      const response = await realHtmlFetcher.fetch('https://www.google.com/search?q=dark+knight+2008');
      const html = await response.text();

      html.should.contain('Dark Knight');
      html.should.contain('>>> cached file content for url with query parameter <<<');
    });

    context('multiple response objects at one time', function() {
      let response1;
      let response2;

      before('let\'s have a page cached, and two new response objects', async function() {
        /* Reason: first time the original fetch throws the error, and it is ok.
         * When working from cache, the error is thrown by RealHtmlFetcher.
         */
        await (await realHtmlFetcher.fetch('https://www.google.com')).text();

        response1 = await realHtmlFetcher.fetch('https://www.google.com');
        response2 = await realHtmlFetcher.fetch('https://www.google.com');
      });

      it('both objects\' text() can be called', async function() {
        await response1.text();
        await response2.text();
      });

      it('both objects\' text() throws error on 2nd call', async function() {
        await response1.text()
            .should.be.rejectedWith(TypeError, 'body used already');
        await response2.text()
            .should.be.rejectedWith(TypeError, 'body used already');
      });
    });
  });


  function removeCacheFolder() {
    if (fs.existsSync(realHtmlFetcher.CachePath)) {
      const folderContent = fs.readdirSync(realHtmlFetcher.CachePath);
      folderContent
          .forEach((x) => fs.unlinkSync(realHtmlFetcher.CachePath + x));

      fs.rmdirSync(realHtmlFetcher.CachePath);
    }
  }
});
