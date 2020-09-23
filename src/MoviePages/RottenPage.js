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
    const metaDataJSON = this.readMetadataJSON();

    const title = metaDataJSON.name;
    const year = this.readYear();
    const tomatoMeter = this.readTomatoMeter();
    const numberOfCriticRatings = this.readNumberOfCriticsVotes(tomatoMeter);
    const audienceScore = this.readAudienceScore();
    const numberOfUserRatings = this.readNumberOfUserVotes(audienceScore);

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

  readYear() {
    return Number(this.getTitleMetaTag().match(/\d{4}(?=\)$)/));
  }

  readTomatoMeter() {
    const tomatoMeterElement = this.document.body
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .getElementsByClassName('mop-ratings-wrap__percentage')[0];

    return tomatoMeterElement
      ? Number(tomatoMeterElement.innerHTML.replace(/[^0-9]/g, ''))
      : null;
  }

  readNumberOfCriticsVotes(tomatoMeter) {
    return tomatoMeter
      ? Number(
          this.document.body
            .getElementsByClassName('mop-ratings-wrap__half')[0]
            .querySelectorAll('small.mop-ratings-wrap__text--small')[0]
            .textContent.replace(/[^0-9]/g, '')
        )
      : null;
  }

  readAudienceScore() {
    const audienceScoreElement = this.document.body
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .getElementsByClassName('mop-ratings-wrap__percentage')[0];

    return audienceScoreElement
      ? Number(audienceScoreElement.innerHTML.replace(/[^0-9]/g, ''))
      : null;
  }

  readNumberOfUserVotes(audienceScore) {
    return audienceScore
      ? Number(
          this.document.body
            .getElementsByClassName('mop-ratings-wrap__half')[1]
            .querySelectorAll('strong.mop-ratings-wrap__text--small')[0]
            .textContent.replace(/[^0-9]/g, '')
        )
      : null;
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
    const tomatoMeterElement = this.generateElement(
      `<section id="mv-imdb-scores" class="mop-ratings-wrap__row js-scoreboard-container"` +
        `  style="border-top:2px solid #2a2c32;margin-top:20px">` +
        `  <div class="mop-ratings-wrap__half" style="min-width:240px">` +
        `  </div>` +
        `  <div class="mop-ratings-wrap__half audience-score" style="min-width:240px">` +
        `  </div>` +
        `</section>`
    );

    let metacriticsElement;
    if (movieData.criticsRating) {
      metacriticsElement = this.generateElement(
        `      <h2 class="mop-ratings-wrap__score">` +
          `      <a href="${movieData.url}criticreviews" class="unstyled articleLink">` +
          `        <span class="mop-ratings-wrap__percentage" title="Open Critic Reviews on IMDb">${movieData.criticsRating}</span></a></h2>` +
          `    <div class="mop-ratings-wrap__review-totals" style="margin-top:0px">` +
          `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
          `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
          `      <small class="mop-ratings-wrap__text--small">${movieData.numberOfCriticsVotes}</small>` +
          `    </div>`
      );
    } else {
      metacriticsElement = this.generateElement(
        `      <a href="${movieData.url}criticreviews" class="unstyled articleLink">` +
          `        <div class="mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion"` +
          ` title="Open Critic Reviews on IMDb">There are no<br>Metacritic reviews</div></a>` +
          `    <div class="mop-ratings-wrap__review-totals" style="margin-top:0px">` +
          `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
          `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
          `      <small class="mop-ratings-wrap__text--small">N/A</small>` +
          `    </div>`
      );
    }
    tomatoMeterElement
      .getElementById('mv-imdb-scores')
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .appendChild(metacriticsElement.body.children[0]);
    tomatoMeterElement
      .getElementById('mv-imdb-scores')
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .appendChild(metacriticsElement.body.children[0]);

    let userratingElement;
    if (movieData.userRating) {
      userratingElement = this.generateElement(
        `    <h2 class="mop-ratings-wrap__score">` +
          `      <a href="${movieData.url}" class="unstyled articleLink">` +
          `        <span class="mop-ratings-wrap__percentage" title="Open ${
            movieData.title
          } on IMDb">${movieData.userRating.toLocaleString('en', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}</span>` +
          `      </a>` +
          `    </h2>` +
          `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released" style="margin-top:0px">` +
          `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating${this.generateToplistPositionString(
            movieData
          )}</h3>` +
          `      <strong class="mop-ratings-wrap__text--small">Number of votes: ${movieData.numberOfUserVotes.toLocaleString(
            'en'
          )}</strong>` +
          `    </div>`
      );
    } else {
      userratingElement = this.generateElement(
        `      <a href="${movieData.url}" class="unstyled articleLink" title="Open ${movieData.title} on IMDb">` +
          `  <div class="audience-score__italics mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion mop-ratings-wrap__text--not-released">` +
          `        <p class="mop-ratings-wrap__prerelease-text">Coming soon</p>` +
          `    </div>` +
          `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released" style="margin-top:0px">` +
          `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating</h3>` +
          `      <strong class="mop-ratings-wrap__text--small">Number of votes: N/A</strong>` +
          `    </div>` +
          `      </a>`
      );
    }
    tomatoMeterElement
      .getElementById('mv-imdb-scores')
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .appendChild(userratingElement.body.children[0]);
    if (userratingElement.body.children[0]) {
      tomatoMeterElement
        .getElementById('mv-imdb-scores')
        .getElementsByClassName('mop-ratings-wrap__half')[1]
        .appendChild(userratingElement.body.children[0]);
    }
    return tomatoMeterElement.body.children[0];
  }

  generateElement(innerHTML) {
    const parser = new DOMParser();
    const tomatoMeterElement = parser.parseFromString(innerHTML, 'text/html');
    return tomatoMeterElement;
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
