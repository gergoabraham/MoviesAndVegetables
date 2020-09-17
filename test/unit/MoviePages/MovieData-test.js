/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

describe('MovieData', function() {
  it('contain stuff', function() {
    const movieData = new MovieData(
        'The Dark Knight', 2008,
        'url of movie',
        9.0, 2160000,
        84, 0,
        4,
    );

    movieData.title.should.equal('The Dark Knight');
    movieData.year.should.equal(2008);
    movieData.url.should.equal('url of movie');
    movieData.userRating.should.equal(9);
    movieData.numberOfUserVotes.should.equal(2160000);
    movieData.criticsRating.should.equal(84);
    movieData.numberOfCriticsVotes.should.equal(0);
    movieData.toplistPosition.should.equal(4);
  });
});
