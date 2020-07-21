/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const fakeFetch = require('./fetchFake');


describe('fetch fake', function() {
  before(function() {
    fakeFetch.activateFetchFake();
  });

  context('setup', function() {
    it('should register global fetch() fake', function() {
      global.fetch = undefined;

      fakeFetch.activateFetchFake();

      (typeof global.fetch).should.equal('function');
    });
  });

  context('fetch(): response object', function() {
    it('should contain text()', async function() {
      const returnValue = await fetch('https://www.fetch-fake.com/test-file-to-load');

      returnValue.should.contain.key('text');
      (typeof returnValue.text).should.equal('function');
    });

    it('should contain url', async function() {
      const returnValue = await fetch('https://www.fetch-fake.com/test-file-to-load');

      returnValue.should.contain.key('url');
      returnValue.url.should.equal('https://www.fetch-fake.com/test-file-to-load');
    });
  });

  context('file handling', function() {
    it('fetch() should throw error if file is not found', async function() {
      await fetch('www.no-such-file.com').should.be
          .rejectedWith('fetch() fake: no file matches the url.\n\n' +
                        'url: www.no-such-file.com\n\n' +
                        'filename: no-such-file.html');
    });

    it('text() should return file content', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load');
      const text = await response.text();

      text.should.equal('You found the first one!');
    });

    it('should find files with comments in file name', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-with-comment');
      const text = await response.text();

      text.should.equal('Great job, Mr. Fake!');
    });
  });

  context('input url handling', function() {
    it('should fetch subpage (x.com/y/z)', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load/another-one');
      const text = await response.text();

      text.should.equal('You found the second one!');
    });

    it('should handle query parameters (x.com/y/z?a=2&b=3)', async function() {
      const response = await fetch(
          'https://www.fetch-fake.com/test-file-to-load/another-one?a=2&b=3');
      const text = await response.text();

      text.should.equal('Wow, parameters!');
    });
  });

  context('url redirection', function() {
    it('url should be changed if fetched file contains "---> [new url]"', async function() {
      const returnValue = await fetch('https://www.fetch-fake.com/redirected-page');

      returnValue.should.contain.key('url');
      returnValue.url.should.equal('https://redirected.com/here-we-are');
    });
  });
});
