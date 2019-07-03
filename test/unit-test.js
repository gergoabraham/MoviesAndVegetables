
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
