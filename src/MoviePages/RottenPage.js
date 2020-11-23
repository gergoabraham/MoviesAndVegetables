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
  static get HOST_NAME() {
    return 'www.rottentomatoes.com';
  }

  /**
   * @return  {MovieInfo} movie
   */
  async getMovieInfo() {
    const metaDataJSON = this._readMetadataJSON();

    const title = metaDataJSON.name;
    const year = this._readYear();

    return new MovieInfo(title, year);
  }

  /**
   * @return  {MovieInfoWithRatings} movie
   */
  async getMovieInfoWithRatings() {
    const criticRatings = await this._readCriticRatings();
    const userRatings = await this._readUserRatings();
    const criticsConsensus = this._readCriticsConsensus();

    return new MovieInfoWithRatings(
      await this.getMovieInfo(),
      this._url,
      RottenPage.NAME,
      null,
      criticsConsensus,
      criticRatings,
      userRatings
    );
  }

  _readYear() {
    return Number(this._getTitleMetaTag().match(/\d{4}(?=\)$)/));
  }

  async _readCriticRatings() {
    const tomatometer = this._readTomatometer();

    return tomatometer
      ? new Ratings(
          tomatometer,
          this._readNumberOfCriticRatings(),
          await this._readTomatometerLogoUrl()
        )
      : null;
  }

  _readTomatometer() {
    return this._readScore(0);
  }

  _readNumberOfCriticRatings() {
    return Number(
      this._document.body
        .getElementsByClassName('mop-ratings-wrap__half')[0]
        .querySelectorAll('small.mop-ratings-wrap__text--small')[0]
        .textContent.replace(/[^0-9]/g, '')
    );
  }

  async _readTomatometerLogoUrl() {
    let logoUrl;

    try {
      const freshness = this._readTomatometerFreshness();

      logoUrl = await this._readLogoUrl(freshness);
    } catch (e) {
      logoUrl = null;
    }

    return logoUrl;
  }

  _readTomatometerFreshness() {
    const tomatometerIcon = this._document
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .querySelector('span.mop-ratings-wrap__icon.meter-tomato');

    return tomatometerIcon.className.match(/(certified.fresh|fresh|rotten)/)[0];
  }

  async _readUserRatings() {
    const audienceScore = this._readAudienceScore();

    return audienceScore
      ? new Ratings(
          audienceScore,
          this._readNumberOfUserRatings(),
          await this._readAudienceScoreLogoUrl()
        )
      : null;
  }

  _readAudienceScore() {
    return this._readScore(1);
  }

  _readScore(i) {
    const audienceScoreElement = this._document.body
      .getElementsByClassName('mop-ratings-wrap__half')
      [i].getElementsByClassName('mop-ratings-wrap__percentage')[0];

    return audienceScoreElement
      ? Number(audienceScoreElement.innerHTML.replace(/[^0-9]/g, ''))
      : null;
  }

  _readNumberOfUserRatings() {
    return Number(
      this._document.body
        .getElementsByClassName('mop-ratings-wrap__half')[1]
        .querySelectorAll('strong.mop-ratings-wrap__text--small')[0]
        .textContent.replace(/[^0-9]/g, '')
    );
  }

  async _readAudienceScoreLogoUrl() {
    let logoUrl;

    try {
      const freshness = this._readAudienceScoreFreshness();

      logoUrl = await this._readLogoUrl(freshness);
    } catch (e) {
      logoUrl = null;
    }

    return logoUrl;
  }

  _readAudienceScoreFreshness() {
    const freshnessIcon = this._document
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .querySelector('span.mop-ratings-wrap__icon.meter-tomato');

    return freshnessIcon.className.match(/(upright|spilled)/)[0];
  }

  async _readLogoUrl(freshness) {
    const css = await this._fetchCachedCss();
    const relativeIconUrl = this._findLogoUrlInCss(css, freshness);

    return this._convertToAbsoluteUrl(relativeIconUrl);
  }

  async _fetchCachedCss() {
    this.css = this.css || (await this._fetchCss());

    return this.css;
  }

  async _fetchCss() {
    const matchedStyleSheetUrl = this._getStylesheetUrl(/global.*\.css$/);

    const relativeUrl = matchedStyleSheetUrl.match('/assets.+');
    const styleSheetUrl = this._convertToAbsoluteUrl(relativeUrl);

    return RottenPage._fetchTextContent(styleSheetUrl);
  }

  _findLogoUrlInCss(css, freshness) {
    return css.match(
      new RegExp(
        `\\.icon\\.big\\.${freshness}[^{]*{background:transparent url\\(([^)]+)`,
        'i'
      )
    )[1];
  }

  _convertToAbsoluteUrl(relativeUrl) {
    return 'https://www.rottentomatoes.com' + relativeUrl;
  }

  _readCriticsConsensus() {
    const criticsConsensusElement = this._document.querySelector(
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
    this._fixCenterAlignmentOfTomatometerAndAudienceScore();

    const ratingsWrapElement = this._getRatingsWrapElement();

    ratingsWrapElement.append(this._generateImdbRatingsRowElement(movie));

    if (movie.summary) {
      ratingsWrapElement.append(this._generateImdbSummaryElement(movie));
    }
  }

  _getRatingsWrapElement() {
    return this._document.querySelector('section.mop-ratings-wrap__info');
  }

  _fixCenterAlignmentOfTomatometerAndAudienceScore() {
    const ratingsContainers = this._document.querySelectorAll(
      'div.mop-ratings-wrap__half'
    );

    ratingsContainers.forEach((x) => (x.style.flexBasis = '100%'));
  }

  _generateImdbRatingsRowElement(movie) {
    const ratingsRowElement = this._generateEmptyRatingsRowElement();
    const metascoreElement = this._generateMetascoreElement(movie);
    const userRatingsElement = this._generateUserRatingsElement(movie);

    ratingsRowElement
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .appendChild(metascoreElement);

    ratingsRowElement
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .appendChild(userRatingsElement);

    return ratingsRowElement;
  }

  _generateEmptyRatingsRowElement() {
    return this._generateElement(
      `<section id="mv-imdb-scores" class="mop-ratings-wrap__row js-scoreboard-container"` +
        `  style="border-top:2px solid #2a2c32;margin-top:30px;padding-top:20px">` +
        `  <div class="mop-ratings-wrap__half" style="flex-basis: 100%">` +
        `    </div>` +
        `  <div class="mop-ratings-wrap__half audience-score" style="flex-basis: 100%">` +
        `    </div>` +
        `</section>`
    );
  }

  _generateMetascoreElement(movie) {
    let metascoreOuterHtml;

    if (movie.criticRatings) {
      metascoreOuterHtml = this._getFilledMetascoreHtml(movie);
    } else {
      metascoreOuterHtml = this._getEmptyMetascoreHtml(movie);
    }

    return this._generateElement(metascoreOuterHtml);
  }

  _getFilledMetascoreHtml(movie) {
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

  _getEmptyMetascoreHtml(movie) {
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

  _generateUserRatingsElement(movie) {
    let userRatingsElement;

    if (movie.userRatings) {
      userRatingsElement = this._generateFilledUserRatingsElement(movie);
    } else {
      userRatingsElement = this._generateEmptyUserRatingsElement(movie);
    }

    return userRatingsElement;
  }

  _generateFilledUserRatingsElement(movie) {
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
      `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating${this._generateToplistPositionString(
        movie
      )}</h3>` +
      `      <strong class="mop-ratings-wrap__text--small">User Ratings: ${movie.userRatings.count.toLocaleString(
        'en'
      )}</strong>` +
      `    </div>` +
      `      </a>`;

    const userRatingsElement = this._generateElement(userratingOuterHtml);

    const userRatingsLogo = this._generateElement(movie.userRatings.custom);

    userRatingsLogo.style.verticalAlign = 'middle';
    userRatingsElement.firstElementChild.prepend(userRatingsLogo);

    return userRatingsElement;
  }

  _generateEmptyUserRatingsElement(movie) {
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

    return this._generateElement(userratingOuterHtml);
  }

  _generateToplistPositionString(movie) {
    return movie.toplistPosition ? ` #${movie.toplistPosition}/250` : ``;
  }

  _generateImdbSummaryElement(movie) {
    return this._generateElement(
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
