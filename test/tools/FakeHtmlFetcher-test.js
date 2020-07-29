/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

describe('FakeHtmlFetcher', function() {
  context('setup', function() {
    it('register global fetch() fake', function() {
      fetch = undefined;

      FakeHtmlFetcher.activateAsGlobalFetch();

      (typeof fetch).should.equal('function');
      fetch.should.equal(FakeHtmlFetcher.fetch);
    });
  });

  context('fetch(): response object', function() {
    it('contain text()', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load');

      response.should.contain.key('text');
      (typeof response.text).should.equal('function');
    });

    it('contain url', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load');

      response.should.contain.key('url');
      response.url.should.equal('https://www.fetch-fake.com/test-file-to-load');
    });
  });

  context('text() behaviour', function() {
    it('second call to text() throws error', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load');
      await response.text();
      await response.text()
          .should.be.rejectedWith(TypeError, 'body used already');
    });
  });

  context('file handling', function() {
    it('fetch() throws error if file is not found', async function() {
      await fetch('www.no-such-file.com').should.be
          .rejectedWith('fetch() fake: no file matches the url.\n\n' +
                        'url: www.no-such-file.com\n\n' +
                        'filename: no-such-file.html');
    });

    it('text() returns file content', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load');
      const text = await response.text();

      text.should.equal('You found the first one!');
    });

    it('find files with comments in file name', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-with-comment');
      const text = await response.text();

      text.should.equal('Great job, Mr. Fake!');
    });
  });

  context('input url handling', function() {
    it('fetch subpage (x.com/y/z)', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load/another-one');
      const text = await response.text();

      text.should.equal('You found the second one!');
    });

    it('fetch url with closing slash', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load/another-one/');
      const text = await response.text();

      text.should.equal('You found the second one!');
    });

    it('handle query parameters (x.com/y/z?a=2&b=3)', async function() {
      const response = await fetch(
          'https://www.fetch-fake.com/test-file-to-load/another-one?a=2&b=3');
      const text = await response.text();

      text.should.equal('Wow, parameters!');
    });
  });

  context('url redirection', function() {
    it('url is changed if fetched file contains "---> [new url]"', async function() {
      const response = await fetch('https://www.fetch-fake.com/redirected-page');

      response.should.contain.key('url');
      response.url.should.equal('https://redirected.com/here-we-are');
    });
  });
});
