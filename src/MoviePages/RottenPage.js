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
    return 'www.rottentomatoes.com/m';
  }

  /**
   * @return  {MovieInfo} movie
   */
  async getMovieInfo() {
    this._getScoreDetails();
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

    this._getScoreDetails();

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

  _getScoreDetails() {
    const scoreDetailsElement = this._document.getElementById('scoreDetails');

    this.scoreDetails = scoreDetailsElement
      ? JSON.parse(scoreDetailsElement.textContent)
      : null;
  }

  _readYear() {
    const info = this.scoreDetails.scoreboard.info;

    const year = info.match(/\d{4}/)[0];

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
    return this.scoreDetails.scoreboard.tomatometerScore.value;
  }

  _readNumberOfCriticRatings() {
    return this.scoreDetails.scoreboard.tomatometerScore.ratingCount;
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
    return this.scoreDetails.scoreboard.tomatometerScore.state;
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
    return this.scoreDetails.scoreboard.audienceScore.value;
  }

  _readNumberOfUserRatings() {
    return this.scoreDetails.scoreboard.audienceScore.ratingCount;
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
    return this.scoreDetails.scoreboard.audienceScore.state;
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
    const matchedStyleSheetUrl = this._getStylesheetUrl(/index.*\.css$/);

    const relativeUrl = matchedStyleSheetUrl.match('/assets.+');
    const styleSheetUrl = this._convertToAbsoluteUrl(relativeUrl);

    return RottenPage._fetchTextContent(styleSheetUrl);
  }

  _findLogoUrlInCss(css, freshness) {
    return css.match(
      new RegExp(
        `\\.icon__${freshness}[^}]*{background-image:url\\(([^)]+)`,
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
