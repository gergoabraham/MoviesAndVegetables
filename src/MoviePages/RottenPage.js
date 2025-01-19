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
    const director = metaDataJSON.director[0].name;

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
    const scoreCardElement = this._document.getElementById(
      'media-scorecard-json'
    );

    this.scoreCard = scoreCardElement
      ? JSON.parse(scoreCardElement.textContent)
      : null;
  }

  _readYear() {
    return null;
  }

  async _readCriticRatings() {
    const tomatometer = this._readTomatometer();

    return tomatometer
      ? new Ratings(
          tomatometer,
          this._readNumberOfCriticRatings(),
          this._getTomatometerLogo()
        )
      : null;
  }

  _readTomatometer() {
    return +this.scoreCard.criticsScore.score;
  }

  _readNumberOfCriticRatings() {
    return this.scoreCard.criticsScore.ratingCount;
  }

  _getTomatometerLogo() {
    const sentiment = this.scoreCard.criticsScore?.sentiment;
    const certified = this.scoreCard.criticsScore?.certified;

    if (!sentiment) return null;

    if (sentiment.match(/negative/i)) {
      return rottenTomatoesIcons.critics.negative;
    }

    if (sentiment.match(/positive/i)) {
      if (certified) {
        return rottenTomatoesIcons.critics.certifiedPositive;
      } else {
        return rottenTomatoesIcons.critics.positive;
      }
    }
  }

  async _readUserRatings() {
    const audienceScore = this._readAudienceScore();

    Logger.log(audienceScore);

    return audienceScore
      ? new Ratings(
          audienceScore,
          this._readNumberOfUserRatings(),
          this._getAudienceScoreLogo(),
          true
        )
      : null;
  }

  _readAudienceScore() {
    return +this.scoreCard.audienceScore.score;
  }

  _readNumberOfUserRatings() {
    return +this.scoreCard.audienceScore.bandedRatingCount
      .match(/\d+/g)
      .join('');
  }

  _getAudienceScoreLogo() {
    const sentiment = this.scoreCard.audienceScore.sentiment;

    if (!sentiment) return null;

    if (sentiment.match(/negative/i)) {
      return rottenTomatoesIcons.audienceScore.negative;
    }

    if (sentiment.match(/positive/i)) {
      return rottenTomatoesIcons.audienceScore.positive;
    }
  }

  _readCriticsConsensus() {
    const criticsConsensusElement = this._document.querySelector(
      '#critics-consensus p'
    );

    return criticsConsensusElement
      ? new Summary('Critics Consensus', criticsConsensusElement.textContent)
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
