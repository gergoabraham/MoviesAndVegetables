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

  context('fetch', function() {
    it('should return with response object incl. text()', async function() {
      const returnValue = await fetch('https://fetch-fake.com/test-file-to-load');

      returnValue.should.have.key('text');
      (typeof returnValue.text).should.equal('function');
    });
  });

  context('text()', function() {
    it('should fetch x.com/y', async function() {
      const response = await fetch('fetch-fake.com/test-file-to-load');
      const text = await response.text();

      text.should.equal('You found the first one!');
    });

    it('should handle "www."', async function() {
      const response = await fetch('www.fetch-fake.com/test-file-to-load');
      const text = await response.text();

      text.should.equal('You found the first one!');
    });

    it('should handle https://', async function() {
      const response = await fetch('https://fetch-fake.com/test-file-to-load');
      const text = await response.text();

      text.should.equal('You found the first one!');
    });

    it('should fetch subpage (x.com/y/z)', async function() {
      const response = await fetch('https://www.fetch-fake.com/test-file-to-load/another-one');
      const text = await response.text();

      text.should.equal('You found the second one!');
    });

    it('should throw error to fail test if file is not found', async function() {
      await fetch('www.no-such-file.com').should.be
          .rejectedWith('fetch() fake: no file matches the url.\n\n' +
           'url: www.no-such-file.com\n\n' +
           'filename: no-such-file.html');
    });
  });
});
