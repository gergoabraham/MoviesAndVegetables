/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class RottenPage extends MoviePage {
  static get NAME() {
    return 'RottenTomatoes';
  }

  static get URL_PATTERN() {
    return /https:\/\/www\.rottentomatoes\.com\/m\/[^&]+/;
  }

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

    let css;
    if (audienceScore || tomatoMeter) {
      css = await this.fetchCss();
    }

    const userRatingLogo = await this.readAudienceScoreLogoUrl(
      css,
      audienceScore
    );
    const criticsRatingLogo = await this.readTomatometerLogoUrl(
      css,
      tomatoMeter
    );

    return new MovieData(
      title,
      year,
      this.url,
      audienceScore,
      numberOfUserRatings,
      tomatoMeter,
      numberOfCriticRatings,
      null,
      userRatingLogo,
      criticsRatingLogo
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

  async fetchCss() {
    const stylesheetLinkElements = this.document.querySelectorAll(
      'link[as="style"]'
    );
    const styleSheetLinks = Array.from(stylesheetLinkElements).map(
      (linkElement) => linkElement.href
    );
    const matchedStyleSheets = styleSheetLinks.filter((link) =>
      link.match(/global.*\.css/)
    );
    const relativeUrl = matchedStyleSheets[0].match('/assets.+');
    const styleSheetUrl = 'https://www.rottentomatoes.com' + relativeUrl;

    const cssResponse = await fetch(styleSheetUrl);
    return cssResponse.text();
  }

  async readAudienceScoreLogoUrl(css, audienceScore) {
    let audienceScoreLogo = null;

    if (audienceScore) {
      const freshness = this.readAudienceScoreFreshness();
      const iconUrl = this.findLogoUrl(css, freshness);

      audienceScoreLogo = 'https://www.rottentomatoes.com' + iconUrl;
    }

    return audienceScoreLogo;
  }

  readAudienceScoreFreshness() {
    const freshnessIcon = this.document
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .querySelector('span.mop-ratings-wrap__icon.meter-tomato');

    return freshnessIcon.className.match(/(upright|spilled)/)[0];
  }

  async readTomatometerLogoUrl(css, tomatoMeter) {
    let tomatometerLogo = null;

    if (tomatoMeter) {
      const freshness = this.readTomatometerFreshness();
      const iconUrl = this.findLogoUrl(css, freshness);

      tomatometerLogo = 'https://www.rottentomatoes.com' + iconUrl;
    }

    return tomatometerLogo;
  }

  readTomatometerFreshness() {
    const tomatometerIcon = this.document
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .querySelector('span.mop-ratings-wrap__icon.meter-tomato');

    return tomatometerIcon.className.match(/(certified.fresh|fresh|rotten)/)[0];
  }

  findLogoUrl(css, freshness) {
    return css.match(
      new RegExp(
        `\\.icon\\.big\\.${freshness}[^{]*{background:transparent url\\(([^)]+)`,
        'i'
      )
    )[1];
  }

  /**
   * @param  {MovieData} movieData
   */
  injectRatings(movieData) {
    this.fixCenterAlignmentOfTomatoMeterAndAudienceScore();

    const imdbScoreElement = this.generateImdbRatingsRowElement(movieData);
    const scoreboardContainers = this.document.querySelectorAll(
      'section.mop-ratings-wrap__row.js-scoreboard-container'
    );
    scoreboardContainers[0].after(imdbScoreElement);
  }

  fixCenterAlignmentOfTomatoMeterAndAudienceScore() {
    const ratingsContainers = this.document.querySelectorAll(
      'div.mop-ratings-wrap__half'
    );
    ratingsContainers.forEach((x) => (x.style.flexBasis = '100%'));
  }

  generateImdbRatingsRowElement(movieData) {
    const ratingsRowElement = this.generateEmptyRatingsRowElement();
    const metaCriticsElement = this.generateMetacriticsElement(movieData);
    const userRatingElement = this.generateUserRatingElement(movieData);

    ratingsRowElement
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .appendChild(metaCriticsElement);

    ratingsRowElement
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .appendChild(userRatingElement);

    return ratingsRowElement;
  }

  generateEmptyRatingsRowElement() {
    return this.generateElement(
      `<section id="mv-imdb-scores" class="mop-ratings-wrap__row js-scoreboard-container"` +
        `  style="border-top:2px solid #2a2c32;margin-top:30px;padding-top:20px">` +
        `  <div class="mop-ratings-wrap__half" style="flex-basis: 100%">` +
        `    </div>` +
        `  <div class="mop-ratings-wrap__half audience-score" style="flex-basis: 100%">` +
        `    </div>` +
        `</section>`
    );
  }

  generateMetacriticsElement(movieData) {
    let metacriticsOuterHtml;
    if (movieData.criticsRating) {
      metacriticsOuterHtml =
        `<a href="${movieData.url}criticreviews" class="unstyled articleLink" title="Open Critic Reviews on IMDb">` +
        `      <h2 class="mop-ratings-wrap__score">` +
        `        <span class="mop-ratings-wrap__percentage"` +
        `              style="background-color: ${movieData.criticsRatingColor}; padding: 0px 8px;">${movieData.criticsRating}</span></h2>` +
        `    <div class="mop-ratings-wrap__review-totals">` +
        `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
        `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
        `      <small class="mop-ratings-wrap__text--small">${movieData.numberOfCriticsVotes}</small>` +
        `    </div>` +
        `  </a>`;
    } else {
      metacriticsOuterHtml =
        `      <a href="${movieData.url}criticreviews" class="unstyled articleLink" title="Open Critic Reviews on IMDb">` +
        `        <div class="mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion"` +
        ` >There are no<br>Metacritic reviews</div>` +
        `    <div class="mop-ratings-wrap__review-totals">` +
        `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
        `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
        `      <small class="mop-ratings-wrap__text--small">N/A</small>` +
        `    </div></a>`;
    }
    const metaCriticsElement = this.generateElement(metacriticsOuterHtml);
    return metaCriticsElement;
  }

  generateUserRatingElement(movieData) {
    let userRatingElement;

    if (movieData.userRating) {
      const userratingOuterHtml =
        `<a href="${movieData.url}" class="unstyled articleLink" title="Open ${movieData.title} on IMDb">` +
        `    <h2 class="mop-ratings-wrap__score">` +
        `        <span class="mop-ratings-wrap__percentage" style="vertical-align: middle;">${movieData.userRating.toLocaleString(
          'en',
          {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }
        )}</span>` +
        `    </h2>` +
        `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released">` +
        `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating${this.generateToplistPositionString(
          movieData
        )}</h3>` +
        `      <strong class="mop-ratings-wrap__text--small">Number of votes: ${movieData.numberOfUserVotes.toLocaleString(
          'en'
        )}</strong>` +
        `    </div>` +
        `      </a>`;
      userRatingElement = this.generateElement(userratingOuterHtml);

      const userRatingLogo = this.generateElement(movieData.userRatingLogo);
      userRatingLogo.style.verticalAlign = 'middle';
      userRatingElement.firstElementChild.prepend(userRatingLogo);
    } else {
      const userratingOuterHtml =
        `      <a href="${movieData.url}" class="unstyled articleLink" title="Open ${movieData.title} on IMDb">` +
        `  <div class="audience-score__italics mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion mop-ratings-wrap__text--not-released">` +
        `        <p class="mop-ratings-wrap__prerelease-text">Coming soon</p>` +
        `    </div>` +
        `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released">` +
        `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating</h3>` +
        `      <strong class="mop-ratings-wrap__text--small">Number of votes: N/A</strong>` +
        `    </div>` +
        `      </a>`;
      userRatingElement = this.generateElement(userratingOuterHtml);
    }

    return userRatingElement;
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
