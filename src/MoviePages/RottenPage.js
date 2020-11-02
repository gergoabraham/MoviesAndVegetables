/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class RottenPage extends MoviePage {
  // web-ext thinks of class fields as syntax errors, but getters can be used
  static get NAME() {
    return 'RottenTomatoes';
  }

  static get URL_PATTERN() {
    return /https:\/\/www\.rottentomatoes\.com\/m\/[^&]+/;
  }

  /**
   * @return  {MovieInfo} movie
   */
  async getMovieInfo() {
    const metaDataJSON = this.readMetadataJSON();

    const title = metaDataJSON.name;
    const year = this.readYear();

    return new MovieInfo(title, year);
  }

  /**
   * @return  {MovieInfoWithRatings} movie
   */
  async getMovieInfoWithRatings() {
    const criticRatings = await this.readCriticRatings();
    const userRatings = await this.readUserRatings();
    const criticsConsensus = this.readCriticsConsensus();

    return new MovieInfoWithRatings(
      await this.getMovieInfo(),
      this.url,
      RottenPage.NAME,
      null,
      criticsConsensus,
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
    let logoUrl;

    try {
      const freshness = this.readTomatometerFreshness();
      logoUrl = await this.readLogoUrl(freshness);
    } catch (e) {
      logoUrl = null;
    }

    return logoUrl;
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
    let logoUrl;

    try {
      const freshness = this.readAudienceScoreFreshness();
      logoUrl = await this.readLogoUrl(freshness);
    } catch (e) {
      logoUrl = null;
    }

    return logoUrl;
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
    const matchedStyleSheetUrl = this.getStylesheetUrl(/global.*\.css$/);

    const relativeUrl = matchedStyleSheetUrl.match('/assets.+');
    const styleSheetUrl = this.convertToAbsoluteUrl(relativeUrl);

    return RottenPage.fetchTextContent(styleSheetUrl);
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

  readCriticsConsensus() {
    const criticsConsensusElement = this.document.querySelector(
      'section.mop-ratings-wrap__row.js-scoreboard-container'
    ).previousElementSibling;

    return criticsConsensusElement
      ? new Summary('Critics Consensus', criticsConsensusElement.innerHTML)
      : null;
  }

  /**
   * @param  {MovieInfoWithRatings} movie
   */
  injectRatings(movie) {
    this.fixCenterAlignmentOfTomatometerAndAudienceScore();

    const ratingsWrapElement = this.getRatingsWrapElement();
    ratingsWrapElement.append(this.generateImdbRatingsRowElement(movie));

    if (movie.summary) {
      ratingsWrapElement.append(this.generateImdbSummaryElement(movie));
    }
  }

  getRatingsWrapElement() {
    return this.document.querySelector('section.mop-ratings-wrap__info');
  }

  fixCenterAlignmentOfTomatometerAndAudienceScore() {
    const ratingsContainers = this.document.querySelectorAll(
      'div.mop-ratings-wrap__half'
    );
    ratingsContainers.forEach((x) => (x.style.flexBasis = '100%'));
  }

  generateImdbRatingsRowElement(movie) {
    const ratingsRowElement = this.generateEmptyRatingsRowElement();
    const metascoreElement = this.generateMetascoreElement(movie);
    const userRatingsElement = this.generateUserRatingsElement(movie);

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

  generateMetascoreElement(movie) {
    let metascoreOuterHtml;

    if (movie.criticRatings) {
      metascoreOuterHtml = this.getFilledMetascoreHtml(movie);
    } else {
      metascoreOuterHtml = this.getEmptyMetascoreHtml(movie);
    }

    return this.generateElement(metascoreOuterHtml);
  }

  getFilledMetascoreHtml(movie) {
    return (
      `<a href="${movie.url}criticreviews" class="unstyled articleLink" title="Open ${movie.info.title} Critic Reviews on ${movie.pageName}">` +
      `      <h2 class="mop-ratings-wrap__score">` +
      `        <span class="mop-ratings-wrap__percentage"` +
      `              style="background-color: ${movie.criticRatings.custom}; padding: 0px 8px;">${movie.criticRatings.score}</span></h2>` +
      `    <div class="mop-ratings-wrap__review-totals">` +
      `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
      `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
      `      <small class="mop-ratings-wrap__text--small">${movie.criticRatings.count}</small>` +
      `    </div>` +
      `  </a>`
    );
  }

  getEmptyMetascoreHtml(movie) {
    return (
      `      <a href="${movie.url}criticreviews" class="unstyled articleLink" title="Open ${movie.info.title} Critic Reviews on ${movie.pageName}">` +
      `        <div class="mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion"` +
      ` >There are no<br>Metacritic reviews</div>` +
      `    <div class="mop-ratings-wrap__review-totals">` +
      `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
      `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
      `      <small class="mop-ratings-wrap__text--small">N/A</small>` +
      `    </div></a>`
    );
  }

  generateUserRatingsElement(movie) {
    let userRatingsElement;

    if (movie.userRatings) {
      userRatingsElement = this.generateFilledUserRatingsElement(movie);
    } else {
      userRatingsElement = this.generateEmptyUserRatingsElement(movie);
    }

    return userRatingsElement;
  }

  generateFilledUserRatingsElement(movie) {
    const userratingOuterHtml =
      `<a href="${movie.url}" class="unstyled articleLink" title="Open ${movie.info.title} on ${movie.pageName}">` +
      `    <h2 class="mop-ratings-wrap__score">` +
      `        <span class="mop-ratings-wrap__percentage" style="vertical-align: middle;">${movie.userRatings.score.toLocaleString(
        'en',
        {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }
      )}</span>` +
      `    </h2>` +
      `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released">` +
      `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating${this.generateToplistPositionString(
        movie
      )}</h3>` +
      `      <strong class="mop-ratings-wrap__text--small">User Ratings: ${movie.userRatings.count.toLocaleString(
        'en'
      )}</strong>` +
      `    </div>` +
      `      </a>`;

    const userRatingsElement = this.generateElement(userratingOuterHtml);

    const userRatingsLogo = this.generateElement(movie.userRatings.custom);
    userRatingsLogo.style.verticalAlign = 'middle';
    userRatingsElement.firstElementChild.prepend(userRatingsLogo);

    return userRatingsElement;
  }

  generateEmptyUserRatingsElement(movie) {
    const userratingOuterHtml =
      `      <a href="${movie.url}" class="unstyled articleLink" title="Open ${movie.info.title} on ${movie.pageName}">` +
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

  generateToplistPositionString(movie) {
    return movie.toplistPosition ? ` #${movie.toplistPosition}/250` : ``;
  }

  generateImdbSummaryElement(movie) {
    return this.generateElement(
      `<div id="mv-imdb-summary"` +
        ` title="${movie.summary.title} from ${movie.pageName}"` +
        ` style="padding-top: 20px;">` +
        `  <strong>${movie.summary.title}</strong>` +
        `  <p` +
        `    style="min-height: 0"` +
        `    class="mop-ratings-wrap__text mop-ratings-wrap__text--concensus"` +
        `  >` +
        `    ${movie.summary.content}` +
        `  </p>` +
        `</div>`
    );
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(RottenPage);
}
