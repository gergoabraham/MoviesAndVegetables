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
    return /https:\/\/www\.rottentomatoes\.com\/m\/[^&/]+/;
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
    const director = this._readDirectorFromMetadata(metaDataJSON);

    return new MovieInfo(title, year, director);
  }

  /**
   * @return  {MovieInfoWithRatings} movie
   */
  async getMovieInfoWithRatings() {
    let movieInfo = null;
    let criticRatings = null;
    let userRatings = null;
    let criticsConsensus = null;

    try {
      movieInfo = await this.getMovieInfo();
      criticRatings = await this._readCriticRatings();
      userRatings = await this._readUserRatings();
      criticsConsensus = this._readCriticsConsensus();
    } catch (e) {}

    return new MovieInfoWithRatings(
      movieInfo,
      this._url,
      RottenPage.NAME,
      null,
      criticsConsensus,
      criticRatings,
      userRatings
    );
  }

  _readYear() {
    const yearFromHtmlTitle = this._readYearFromHtmlTitle();
    const yearsFromMovieInfoTable = this._readYearValuesFromMovieInfoTable();

    return Math.min(yearFromHtmlTitle, ...yearsFromMovieInfoTable);
  }

  _readYearFromHtmlTitle() {
    return Number(this._getTitleMetaTag().match(/\d{4}(?=\)$)/));
  }

  _readYearValuesFromMovieInfoTable() {
    const timeElements = this._document.querySelectorAll(
      'li.meta-row .meta-value time[datetime]'
    );

    return Array.from(timeElements)
      .map((elem) => new Date(elem.dateTime).getFullYear())
      .filter((year) => !isNaN(year));
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
    return Number(this._getScoreInfo().tomatometerAllCritics.score);
  }

  _readNumberOfCriticRatings() {
    return this._getScoreInfo().tomatometerAllCritics.ratingCount;
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
    return this._getScoreInfo().tomatometerAllCritics.tomatometerState;
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
    return Number(this._getScoreInfo().audienceAll.score);
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
    return this._getScoreInfo().audienceAll.ratingCount;
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
    return this._getScoreInfo().audienceAll.audienceClass;
  }

  _getScoreInfo() {
    return JSON.parse(
      this._document.body.innerHTML.match(
        /RottenTomatoes\.context\.scoreInfo = ([^;]+\n?);/
      )[1]
    );
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
    const criticsConsensusMatch = this._document.body.innerHTML.match(
      /what-to-know__section-body">\n +<span>(.+)<\/span>/
    );

    return criticsConsensusMatch
      ? new Summary('Critics Consensus', criticsConsensusMatch[1])
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
