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

    const title = metaDataJSON.name.replace(/&\w+;/, '+');
    const year = this._readYear();
    const director = this._readDirector();

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
    } catch (e) {}
    try {
      criticRatings = await this._readCriticRatings();
    } catch (e) {}
    try {
      userRatings = await this._readUserRatings();
    } catch (e) {}
    try {
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
    const scoreBoardInfoElement =
      this._document.querySelector('.scoreboard__info');

    const year = scoreBoardInfoElement.textContent.match(/\d{4}/);

    return Number(year);
  }

  _readDirector() {
    return this._document.querySelector('[data-qa=movie-info-director]')
      .textContent;
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
    return Number(this._text.match(/"tomatometerScore":"?(\d+)"?/)[1]);
  }

  _readNumberOfCriticRatings() {
    return Number(this._text.match(/"tomatometerCount":(\d+)/)[1]);
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
    return this._text.match(/"tomatometerState":"([\w-]+)"/)[1];
  }

  async _readUserRatings() {
    const audienceScore = this._readAudienceScore();

    Logger.log(audienceScore);

    return audienceScore
      ? new Ratings(
          audienceScore,
          this._readNumberOfUserRatings(),
          await this._readAudienceScoreLogoUrl()
        )
      : null;
  }

  _readAudienceScore() {
    return Number(this._text.match(/"audienceScore":"?(\d+)"?/)[1]);
  }

  _readNumberOfUserRatings() {
    return Number(this._text.match(/"audienceCount":(\d+)/)[1]);
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
    return this._text.match(/"audienceState":"([\w-]+)"/)[1];
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
    const criticsConsensusMatch = this._text.match(
      /data-qa="critics-consensus">(.+)<\/span>/
    );

    return criticsConsensusMatch
      ? new Summary('Critics Consensus', criticsConsensusMatch[1])
      : null;
  }

  /**
   * @param  {MovieInfoWithRatings} movie
   */
  injectRatings() {}
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(RottenPage);
}
