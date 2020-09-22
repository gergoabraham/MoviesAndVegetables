/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class RottenPage extends MoviePage {
  /**
   * @return  {MovieData} movieData
   */
  async getMovieData() {
    const rottenScores = this.document.body.querySelectorAll(
      'span.mop-ratings-wrap__percentage'
    );

    const tomatoMeter = rottenScores[0]
      ? Number(rottenScores[0].innerHTML.replace(/[^0-9]/g, ''))
      : null;
    const audienceScore = rottenScores[1]
      ? Number(rottenScores[1].innerHTML.replace(/[^0-9]/g, ''))
      : null;

    const numberOfCriticRatingsElement = this.document.body.querySelectorAll(
      'small.mop-ratings-wrap__text--small'
    )[0];
    const numberOfCriticRatings = tomatoMeter
      ? Number(numberOfCriticRatingsElement.textContent.replace(/[^0-9]/g, ''))
      : null;

    const numberOfUserRatingsElement = this.document.body.querySelectorAll(
      'strong.mop-ratings-wrap__text--small'
    )[1];
    const numberOfUserRatings = audienceScore
      ? Number(numberOfUserRatingsElement.textContent.replace(/[^0-9]/g, ''))
      : null;

    const metaDataJSON = this.readMetadataJSON();
    const title = metaDataJSON.name;

    const year = Number(
      this.document.head
        .querySelector('meta[property="og:title"')
        .getAttribute('content')
        .match(/\d{4}(?=\)$)/)
    );

    return new MovieData(
      title,
      year,
      this.url,
      audienceScore,
      numberOfUserRatings,
      tomatoMeter,
      numberOfCriticRatings,
      null
    );
  }

  /**
   * @param  {MovieData} movieData
   */
  injectRatings(movieData) {
    this.fixAlignmentOfTomatoMeterAndAudienceScore();

    const imdbScoreElement = this.createImdbScoreHtmlElement(movieData);
    const scoreboardContainers = this.document.querySelectorAll(
      'section.mop-ratings-wrap__row.js-scoreboard-container'
    );
    scoreboardContainers[0].after(imdbScoreElement);
  }

  fixAlignmentOfTomatoMeterAndAudienceScore() {
    const ratingsContainers = this.document.querySelectorAll(
      'div.mop-ratings-wrap__half'
    );
    ratingsContainers.forEach((x) =>
      x.setAttribute('style', 'min-width:240px')
    );
  }

  createImdbScoreHtmlElement(movieData) {
    const innerHTML =
      `<section id="mv-imdb-scores" class="mop-ratings-wrap__row js-scoreboard-container"` +
      `style="border-top:2px solid #2a2c32;margin-top:20px">` +
      `<div class="mop-ratings-wrap__half" style="min-width:240px">` +
      `<h2 class="mop-ratings-wrap__score">` +
      `<a href="${movieData.url}criticreviews" class="unstyled articleLink">` +
      `<span class="mop-ratings-wrap__percentage" title="Open Critic Reviews on IMDb">${movieData.criticsRating}</span></a></h2>` +
      `<div class="mop-ratings-wrap__review-totals" style="margin-top:0px">` +
      `<h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
      `<strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
      `<small class="mop-ratings-wrap__text--small">${movieData.numberOfCriticsVotes}</small>` +
      `</div>` +
      `</div>` +
      `<div class="mop-ratings-wrap__half audience-score" style="min-width:240px">` +
      `<h2 class="mop-ratings-wrap__score">` +
      `<a href="${movieData.url}" class="unstyled articleLink">` +
      `<span class="mop-ratings-wrap__percentage" title="Open ${
        movieData.title
      } on IMDb">${movieData.userRating.toLocaleString('en', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}</span>` +
      `</a>` +
      `</h2>` +
      `<div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released"` +
      `style="margin-top:0px">` +
      `<h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating${this.generateToplistPositionString(
        movieData
      )}</h3>` +
      `<strong class="mop-ratings-wrap__text--small">Number of votes: ${movieData.numberOfUserVotes.toLocaleString(
        'en'
      )}</strong>` +
      `</div>` +
      `</div>` +
      `</section>`;

    const parser = new DOMParser();
    const tomatoMeterElement = parser.parseFromString(innerHTML, 'text/html');

    return tomatoMeterElement.body.children[0];
  }

  generateToplistPositionString(movieData) {
    return movieData.toplistPosition
      ? ` #${movieData.toplistPosition}/250`
      : ``;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(RottenPage);
}
