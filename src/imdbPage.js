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

  const tomatoMeter = createTomatoMeterElement(doc, url, percent, votes);
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

function createTomatoMeterElement(doc, url, percent, votes) {
  const tomatoMeter = doc.createElement('div');
  tomatoMeter.setAttribute('class', `titleReviewBarItem TomatoMeter`);

  const scoreContainerA = doc.createElement('a');
  scoreContainerA.setAttribute('href', url);
  tomatoMeter.appendChild(scoreContainerA);

  const scoreContainedDiv = doc.createElement('div');
  const favorableness = window.getFavorableness(percent);
  scoreContainedDiv.setAttribute('class',
      `metacriticScore ${favorableness} titleReviewBarSubItem`);
  scoreContainedDiv.setAttribute('style', 'width: 40px');
  scoreContainerA.appendChild(scoreContainedDiv);

  const scoreContainerSpan = doc.createElement('span');
  scoreContainerSpan.textContent = `${percent}%`;
  scoreContainedDiv.appendChild(scoreContainerSpan);

  tomatoMeter.appendChild(doc.createTextNode(' '));

  // Description
  const titleReviewBarSubItem = doc.createElement('div');
  titleReviewBarSubItem.setAttribute('class', 'titleReviewBarSubItem');
  tomatoMeter.appendChild(titleReviewBarSubItem);
  titleReviewBarSubItem.appendChild(doc.createElement('div'));
  titleReviewBarSubItem.children[0].appendChild(doc.createElement('a'));
  const tomatoMeterDescription =
    tomatoMeter.children[1].children[0].children[0];
  tomatoMeterDescription.innerHTML = 'Tomatometer';
  tomatoMeterDescription.setAttribute('href', url);
  // number of votes
  const subTextContainer = doc.createElement('div');
  titleReviewBarSubItem.appendChild(subTextContainer);
  const subText = doc.createElement('span');
  subTextContainer.appendChild(subText);
  subText.setAttribute('class', 'subText');
  subText.textContent = `Total Count: ${votes}`;

  return tomatoMeter;
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
