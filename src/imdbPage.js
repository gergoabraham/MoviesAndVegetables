'use strict';

window.readMovieDataFromImdbPage = function(doc) {
  const rawJSONContainingMovieData =
    doc.head.querySelector('[type="application/ld+json"]').textContent;
  const movieDataJSON = JSON.parse(rawJSONContainingMovieData);

  if (movieDataJSON['@type'] != 'Movie') {
    throw new Error('Not a movie');
  }

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
          `<span class="subText">` +
            `Total Count: ${window.groupThousands(votes)}</span>\n` +
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

window.injectAudienceScore = function(doc, percent, url, votes) {
  const ratingsWrapper = doc.getElementsByClassName('ratings_wrapper')[0];
  const starRatingWidget = doc.getElementById('star-rating-widget');

  const element = createAudienceScoreElement(percent, url, votes);
  ratingsWrapper.insertBefore(element, starRatingWidget);

  const button = starRatingWidget.children[0].children[0];
  button.setAttribute('style', 'border-left-width: 0px');
};

function createAudienceScoreElement(percent, url, votes) {
  const innerHTML =
    `<div class="imdbRating" id="audience-score"` +
      `style="background:none; text-align:center; padding:2px 0 0 2px;\n`+
      `width:90px;border-left:1px solid #6b6b6b;">\n` +
      `<div class="ratingValue">\n` +
        `<strong title="Audience score from RottenTomatoes">\n` +
          `<span itemprop="ratingValue">${percent}%</span>\n` +
        `</strong>\n` +
      `</div>\n` +
      `<a href="${url}">\n` +
        `<span class="small" itemprop="ratingCount">` +
          `${window.groupThousands(votes)}</span>\n` +
      `</a>\n` +
    `</div>`;

  const parser = new DOMParser();
  const audienceScoreElement = parser.parseFromString(innerHTML, 'text/html');

  return audienceScoreElement.body.children[0];
}

window.groupThousands = function(number) {
  const pattern = /(\d)((\d{3})+$)/g;
  const replaceValue = '$1 $2';

  return String(number)
      .replace(pattern, replaceValue)
      .replace(pattern, replaceValue);
};
