/**
 * Adds dummy rotten score to imdb page.
 * @param {*} doc document
 */
injectRottenScore = function(doc) {
  // Create <a> and <div>
  const a = doc.createElement('a');
  const div = doc.createElement('div');
  a.appendChild(div);
  div.title = 'Open in RottenTomatoes';
  div.setAttribute('align', 'center');

  // Add hyperlink to movie's rotten page
  a.setAttribute('href', 'https://www.rottentomatoes.com/m/shawshank_redemption');

  // Add movie's score
  div.textContent = '🍅91%';

  // Inject element into the html after the user rating
  const currentDiv = doc.getElementById('star-rating-widget');
  currentDiv.parentNode.insertBefore(a, currentDiv.nextSibling);
};
