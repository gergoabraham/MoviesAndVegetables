readMovieDataFromImdbPage = function(doc) {
  const rawJSONContainingMovieData =
    doc.head.querySelector('[type="application/ld+json"]').textContent;
  const movieDataJSON = JSON.parse(rawJSONContainingMovieData);

  movieData = {
    name: movieDataJSON.name,
    year: movieDataJSON.datePublished.substring(0, 4),
    director: movieDataJSON.director.name,
  };

  return movieData;
};

constructSearchUrlForRotten = function(movieData) {
  const {name, director, year} = movieData;

  return `https://www.google.com/search?btnI=true&q=${director}+${name}+${year}+movie+Rotten+Tomatoes`
      .replace(/ /g, '+',);
};

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
