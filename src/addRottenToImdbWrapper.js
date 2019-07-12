document.body.onload = addRottenOnLoad;

/**
 * Wrapper function for addRotten function
 */
function addRottenOnLoad() {
  movieData = readMovieDataFromImdbPage(document);
  console.log(movieData);

  injectRottenScore(document, '91');
}
