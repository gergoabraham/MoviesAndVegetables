/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

const {MoviePage} = require('../src/MoviePage');

describe('MoviePage', function() {
  it('should contain remoteName', function() {
    const moviePage = new MoviePage();
    moviePage.remoteName.should.equal('Rotten Tomatoes');
  });
});
