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

window.injectRottenScore = function(doc, percent, url, votes) {
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
  div.textContent = `🍅${percent}% by ${votes}`;

  // Inject element into the html after the user rating
  const currentDiv = doc.getElementById('star-rating-widget');
  currentDiv.parentNode.insertBefore(a, currentDiv.nextSibling);
};

function createTomatoMeterElement(url, percent, votes) {
  const innerHTML =
    `<div class="titleReviewBarItem TomatoMeter">\n` +
      `<a href="${url}">\n` +
        `<div class="metacriticScore ${window.getFavorableness(percent)}\n` +
          `titleReviewBarSubItem" style="width: 40px">\n` +
          `<span>${percent}%</span>\n` +
      `</div></a>\n` +
      `<div class="titleReviewBarSubItem">\n` +
        `<div>\n` +
          `<a href="${url}">Tomatometer</a>\n` +
        `</div>\n` +
        `<div>\n` +
          `<span class="subText">Total Count: ${votes}</span>\n` +
        `</div>\n` +
      `</div>\n` +
    `</div>`;

  const parser = new DOMParser();
  const tomatoMeterElement = parser.parseFromString(innerHTML, 'text/html');

  return tomatoMeterElement.body.children[0];
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
