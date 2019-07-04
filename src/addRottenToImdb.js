/**
 * Adds dummy rotten score to imdb page.
 * @param {*} doc document
 * @param {*} percent movie's rotten score
 */
injectRottenScore = function(doc, percent) {
  // Create <a> and <div>
  const a = doc.createElement('a');
  const div = doc.createElement('div');
  a.appendChild(div);
  div.title = 'Open in RottenTomatoes';
  div.setAttribute('align', 'center');
  div.setAttribute('id', 'movies-and-vegetables-rotten-rating');

  // Add hyperlink to movie's rotten page
  a.setAttribute('href', 'https://www.rottentomatoes.com/m/shawshank_redemption');

  // Add movie's score
  div.textContent = '🍅' + percent + '%';

  // Inject element into the html after the user rating
  const currentDiv = doc.getElementById('star-rating-widget');
  currentDiv.parentNode.insertBefore(a, currentDiv.nextSibling);
};
