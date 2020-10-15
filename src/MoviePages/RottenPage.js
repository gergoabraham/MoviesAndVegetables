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

    const criticRatings = await this.readCriticRatings();
    const userRatings = await this.readUserRatings();

    return new MovieData(
      title,
      year,
      this.url,
      null,
      criticRatings,
      userRatings
    );
  }

  readYear() {
    return Number(this.getTitleMetaTag().match(/\d{4}(?=\)$)/));
  }

  async readCriticRatings() {
    const tomatometer = this.readTomatometer();

    return tomatometer
      ? new Ratings(
          tomatometer,
          this.readNumberOfCriticRatings(),
          await this.readTomatometerLogoUrl()
        )
      : null;
  }

  readTomatometer() {
    return this.readScore(0);
  }

  readNumberOfCriticRatings() {
    return Number(
      this.document.body
        .getElementsByClassName('mop-ratings-wrap__half')[0]
        .querySelectorAll('small.mop-ratings-wrap__text--small')[0]
        .textContent.replace(/[^0-9]/g, '')
    );
  }

  async readTomatometerLogoUrl() {
    const freshness = this.readTomatometerFreshness();
    return this.readLogoUrl(freshness);
  }

  readTomatometerFreshness() {
    const tomatometerIcon = this.document
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .querySelector('span.mop-ratings-wrap__icon.meter-tomato');

    return tomatometerIcon.className.match(/(certified.fresh|fresh|rotten)/)[0];
  }

  async readUserRatings() {
    const audienceScore = this.readAudienceScore();

    return audienceScore
      ? new Ratings(
          audienceScore,
          this.readNumberOfUserRatings(),
          await this.readAudienceScoreLogoUrl()
        )
      : null;
  }

  readAudienceScore() {
    return this.readScore(1);
  }

  readScore(i) {
    const audienceScoreElement = this.document.body
      .getElementsByClassName('mop-ratings-wrap__half')
      [i].getElementsByClassName('mop-ratings-wrap__percentage')[0];

    return audienceScoreElement
      ? Number(audienceScoreElement.innerHTML.replace(/[^0-9]/g, ''))
      : null;
  }

  readNumberOfUserRatings() {
    return Number(
      this.document.body
        .getElementsByClassName('mop-ratings-wrap__half')[1]
        .querySelectorAll('strong.mop-ratings-wrap__text--small')[0]
        .textContent.replace(/[^0-9]/g, '')
    );
  }

  async readAudienceScoreLogoUrl() {
    const freshness = this.readAudienceScoreFreshness();
    return this.readLogoUrl(freshness);
  }

  readAudienceScoreFreshness() {
    const freshnessIcon = this.document
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .querySelector('span.mop-ratings-wrap__icon.meter-tomato');

    return freshnessIcon.className.match(/(upright|spilled)/)[0];
  }

  async readLogoUrl(freshness) {
    const css = await this.fetchCachedCss();
    const relativeIconUrl = this.findLogoUrlInCss(css, freshness);

    return this.convertToAbsoluteUrl(relativeIconUrl);
  }

  async fetchCachedCss() {
    this.css = this.css || (await this.fetchCss());

    return this.css;
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
    const styleSheetUrl = this.convertToAbsoluteUrl(relativeUrl);
    const cssResponse = await fetch(styleSheetUrl);

    return cssResponse.text();
  }

  findLogoUrlInCss(css, freshness) {
    return css.match(
      new RegExp(
        `\\.icon\\.big\\.${freshness}[^{]*{background:transparent url\\(([^)]+)`,
        'i'
      )
    )[1];
  }

  convertToAbsoluteUrl(relativeUrl) {
    return 'https://www.rottentomatoes.com' + relativeUrl;
  }

  /**
   * @param  {MovieData} movieData
   */
  injectRatings(movieData) {
    this.fixCenterAlignmentOfTomatometerAndAudienceScore();

    const imdbRatingsElement = this.generateImdbRatingsRowElement(movieData);
    const scoreboardContainers = this.document.querySelectorAll(
      'section.mop-ratings-wrap__row.js-scoreboard-container'
    );
    scoreboardContainers[0].after(imdbRatingsElement);
  }

  fixCenterAlignmentOfTomatometerAndAudienceScore() {
    const ratingsContainers = this.document.querySelectorAll(
      'div.mop-ratings-wrap__half'
    );
    ratingsContainers.forEach((x) => (x.style.flexBasis = '100%'));
  }

  generateImdbRatingsRowElement(movieData) {
    const ratingsRowElement = this.generateEmptyRatingsRowElement();
    const metascoreElement = this.generateMetascoreElement(movieData);
    const userRatingsElement = this.generateUserRatingsElement(movieData);

    ratingsRowElement
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .appendChild(metascoreElement);

    ratingsRowElement
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .appendChild(userRatingsElement);

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

  generateMetascoreElement(movieData) {
    let metascoreOuterHtml;

    if (movieData.criticRatings) {
      metascoreOuterHtml = this.getFilledMetascoreHtml(movieData);
    } else {
      metascoreOuterHtml = this.getEmptyMetascoreHtml(movieData);
    }

    return this.generateElement(metascoreOuterHtml);
  }

  getFilledMetascoreHtml(movieData) {
    return (
      `<a href="${movieData.url}criticreviews" class="unstyled articleLink" title="Open Critic Reviews on IMDb">` +
      `      <h2 class="mop-ratings-wrap__score">` +
      `        <span class="mop-ratings-wrap__percentage"` +
      `              style="background-color: ${movieData.criticRatings.custom}; padding: 0px 8px;">${movieData.criticRatings.score}</span></h2>` +
      `    <div class="mop-ratings-wrap__review-totals">` +
      `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
      `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
      `      <small class="mop-ratings-wrap__text--small">${movieData.criticRatings.count}</small>` +
      `    </div>` +
      `  </a>`
    );
  }

  getEmptyMetascoreHtml(movieData) {
    return (
      `      <a href="${movieData.url}criticreviews" class="unstyled articleLink" title="Open Critic Reviews on IMDb">` +
      `        <div class="mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion"` +
      ` >There are no<br>Metacritic reviews</div>` +
      `    <div class="mop-ratings-wrap__review-totals">` +
      `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
      `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
      `      <small class="mop-ratings-wrap__text--small">N/A</small>` +
      `    </div></a>`
    );
  }

  generateUserRatingsElement(movieData) {
    let userRatingsElement;

    if (movieData.userRatings) {
      userRatingsElement = this.generateFilledUserRatingsElement(movieData);
    } else {
      userRatingsElement = this.generateEmptyUserRatingsElement(movieData);
    }

    return userRatingsElement;
  }

  generateFilledUserRatingsElement(movieData) {
    const userratingOuterHtml =
      `<a href="${movieData.url}" class="unstyled articleLink" title="Open ${movieData.title} on IMDb">` +
      `    <h2 class="mop-ratings-wrap__score">` +
      `        <span class="mop-ratings-wrap__percentage" style="vertical-align: middle;">${movieData.userRatings.score.toLocaleString(
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
      `      <strong class="mop-ratings-wrap__text--small">User Ratings: ${movieData.userRatings.count.toLocaleString(
        'en'
      )}</strong>` +
      `    </div>` +
      `      </a>`;

    const userRatingsElement = this.generateElement(userratingOuterHtml);

    const userRatingsLogo = this.generateElement(movieData.userRatings.custom);
    userRatingsLogo.style.verticalAlign = 'middle';
    userRatingsElement.firstElementChild.prepend(userRatingsLogo);

    return userRatingsElement;
  }

  generateEmptyUserRatingsElement(movieData) {
    const userratingOuterHtml =
      `      <a href="${movieData.url}" class="unstyled articleLink" title="Open ${movieData.title} on IMDb">` +
      `  <div class="audience-score__italics mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion mop-ratings-wrap__text--not-released">` +
      `        <p class="mop-ratings-wrap__prerelease-text">Coming soon</p>` +
      `    </div>` +
      `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released">` +
      `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating</h3>` +
      `      <strong class="mop-ratings-wrap__text--small">User Ratings: N/A</strong>` +
      `    </div>` +
      `      </a>`;

    return this.generateElement(userratingOuterHtml);
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
