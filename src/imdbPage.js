'use strict';

window.readMovieDataFromImdbPage = function(doc) {
  const rawJSONContainingMovieData =
    doc.head.querySelector('[type="application/ld+json"]').textContent;
  const movieDataJSON = JSON.parse(rawJSONContainingMovieData);

  const movieData = {
    title: movieDataJSON.name,
    year: movieDataJSON.datePublished.substring(0, 4),
  };

  return movieData;
};

window.injectTomatoMeter = function(doc, percent, url, votes) {
  const titleReviewBar = doc.getElementsByClassName('titleReviewBar')[0];
  const firstDivider = titleReviewBar.getElementsByClassName('divider')[0];

  const myDivider = doc.createElement('div');
  myDivider.setAttribute('class', 'divider');
  titleReviewBar.insertBefore(myDivider, firstDivider);

  const tomatoMeter = createTomatoMeterElement(url, percent, votes);
  titleReviewBar.insertBefore(tomatoMeter, firstDivider);
};

window.injectRottenScore = function(doc, percent, url) {
  // Create <a> and <div>
  const a = doc.createElement('a');
  const div = doc.createElement('div');
  a.appendChild(div);
  div.title = 'Open in RottenTomatoes';
  div.setAttribute('align', 'center');
  div.setAttribute('id', 'movies-and-vegetables-rotten-rating');

  // Add hyperlink to movie's rotten page
  a.setAttribute('href', url);

  // Add movie's score
  div.textContent = `🍅${percent}%`;

  // Inject element into the html after the user rating
  const currentDiv = doc.getElementById('star-rating-widget');
  currentDiv.parentNode.insertBefore(a, currentDiv.nextSibling);
};

function createTomatoMeterElement(url, percent, votes) {
  const innerHTML =
    `<div class="titleReviewBarItem TomatoMeter">
      <a href="${url}">
        <div class="metacriticScore ${window.getFavorableness(percent)}
        titleReviewBarSubItem" style="width: 40px">
          <span>${percent}%</span>
      </div></a>
      <div class="titleReviewBarSubItem">
        <div>
          <a href="${url}">Tomatometer</a>
        </div>
        <div>
          <span class="subText">Total Count: ${votes}</span>
        </div>
      </div>
    </div>`;

  const parser = new DOMParser();
  const stuff = parser.parseFromString(innerHTML, 'text/html');

  return stuff.body.children[0];
}

window.getFavorableness = function(percent) {
  let favorableness;

  if (percent >= 61) {
    favorableness = 'favorable';
  } else if (percent >= 41) {
    favorableness = 'mixed';
  } else {
    favorableness = 'unfavorable';
  }

  return `score_${favorableness}`;
};
