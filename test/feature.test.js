const chai = require('chai');
chai.should();

// Import file under test
// eslint-disable-next-line no-unused-vars
const addRottenToImdb = require('../src/addRottenToImdb');

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


