/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class ImdbPage extends MoviePage {
  // web-ext thinks of class fields as syntax errors, but getters can be used
  static get NAME() {
    return 'IMDb';
  }
  static get URL_PATTERN() {
    return /https:\/\/www\.imdb\.com\/title\/tt\d+\//;
  }
  static get HOST_NAME() {
    return 'www.imdb.com';
  }

  /**
   * @return  {MovieInfo} movie
   */
  async getMovieInfo() {
    const metaDataJSON = this._readMetadataJSON();

    if (metaDataJSON['@type'] != 'Movie') {
      throw new Error('Not a movie');
    }

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
    let toplistPosition = null;
    let summary = null;

    try {
      movieInfo = await this.getMovieInfo();
      criticRatings = await this._readCriticRatings();
      userRatings = await this._readUserRatings();
      toplistPosition = this._getToplistPosition();
      summary = this._readSummary();
    } catch (e) {}

    return new MovieInfoWithRatings(
      movieInfo,
      this._url,
      ImdbPage.NAME,
      toplistPosition,
      summary,
      criticRatings,
      userRatings
    );
  }

  _readYear() {
    return Number(this._getTitleMetaTag().match(/\d{4}(?=\) - IMDb)/)[0]);
  }

  async _readCriticRatings() {
    const metascore = this._readMetascore();

    return metascore
      ? new Ratings(
          metascore,
          await this._readCriticReviewCount(),
          await this._getMetascoreColor()
        )
      : null;
  }

  _readMetascore() {
    const metascoreElement = this._getMetascoreElement();

    return metascoreElement
      ? Number(metascoreElement.querySelector('span').innerHTML)
      : null;
  }

  async _readCriticReviewCount() {
    const criticUrl = this._url + 'criticreviews';
    const criticsPage = await this._fetchDOM(criticUrl);

    const numberOfCriticRatings = criticsPage.querySelector(
      'span[itemprop="ratingCount"'
    ).textContent;

    return Number(numberOfCriticRatings);
  }

  async _fetchDOM(url) {
    const response = await fetch(url);
    const pageText = await response.text();

    Logger.logFetch(url, pageText);

    return new DOMParser().parseFromString(pageText, 'text/html');
  }

  async _getMetascoreColor() {
    let color;

    try {
      const metascoreElement = this._getMetascoreElement();

      const css = await this._fetchCss();
      const favorableness = metascoreElement.className.match(/score_\w+/)[0];

      color = css.match(
        `\\.${favorableness}{background-color:(#[a-zA-Z0-9]{6})`
      )[1];
    } catch (e) {
      color = null;
    }

    return color;
  }

  _getMetascoreElement() {
    return this._document.querySelector('div.metacriticScore');
  }

  async _fetchCss() {
    const styleSheetUrl = this._getStylesheetUrl(/\/S\/.*\.css$/);

    return ImdbPage._fetchTextContent(styleSheetUrl);
  }

  _readUserRatings() {
    const userRatings = this._readUserScore();

    return userRatings
      ? new Ratings(
          userRatings,
          this._readNumberOfUserRatings(),
          this._getImdbLogo()
        )
      : null;
  }

  _readUserScore() {
    const userRatingElement = this._document.querySelector(
      'span[itemprop="ratingValue"]'
    );

    return userRatingElement
      ? Number(userRatingElement.innerHTML.replace(',', '.'))
      : null;
  }

  _readNumberOfUserRatings() {
    const numberOfUserRatingsElement = this._document.querySelector(
      'span[itemprop="ratingCount"]'
    );

    return Number(
      numberOfUserRatingsElement.textContent.replace(/[^0-9]/g, ``)
    );
  }

  _getImdbLogo() {
    return this._document.getElementById('home_img').outerHTML;
  }

  _getToplistPosition() {
    const toplistPositionElement = this._document.querySelector(
      'a[href="/chart/top?ref_=tt_awd"'
    );
    const toplistPosition = toplistPositionElement
      ? Number(toplistPositionElement.textContent.match(/\d{1,3}/g)[0])
      : null;

    return toplistPosition;
  }

  _readSummary() {
    const plotSummaryElement = this._document.querySelector('div.summary_text');

    const summary = plotSummaryElement
      ? new Summary('Summary', plotSummaryElement.textContent.trim())
      : null;

    return summary;
  }

  /**
   * @param  {MovieInfoWithRatings} movie
   */
  injectRatings(movie) {
    this._injectTomatoMeter(this._document, movie);
    this._injectAudienceScore(this._document, movie);
    this._injectCriticsConsensus(this._document, movie);
  }

  _injectTomatoMeter(doc, movie) {
    const userRatingElement = doc.querySelector(
      '[data-testid=hero-title-block__aggregate-rating]'
    );

    const tomatoMeter = userRatingElement.cloneNode(true);

    tomatoMeter.id = 'mv-tomatometer';
    tomatoMeter.children[0].textContent = 'TOMATOMETER';

    tomatoMeter.children[1].title = `Open ${movie.info.title} on ${movie.pageName}`;
    tomatoMeter.children[1].href = movie.url;

    const scoreElement = tomatoMeter.querySelector(
      '[class|=AggregateRatingButton__Rating]'
    );

    scoreElement.children[0].textContent = `${movie.criticRatings.score}%`;
    scoreElement.children[1].remove();

    const numberOfVotesElement = tomatoMeter.querySelector(
      '[class|=AggregateRatingButton__TotalRatingAmount]'
    );

    numberOfVotesElement.textContent = `${this._groupThousands(
      movie.criticRatings.count
    )} votes`;

    const originalLogo = tomatoMeter.querySelector('svg');

    originalLogo.children[0].remove();

    const tomatoLogo = document.createElementNS(
      originalLogo.namespaceURI,
      'image'
    );

    tomatoLogo.setAttribute('width', '24px');
    tomatoLogo.setAttribute('height', '24px');
    tomatoLogo.setAttribute('href', movie.criticRatings.custom);

    originalLogo.append(tomatoLogo);

    userRatingElement.after(tomatoMeter);
  }

  _injectAudienceScore(doc, movie) {
    const userRatingElement = doc.querySelector(
      '[data-testid=hero-title-block__aggregate-rating]'
    );

    const audienceScore = userRatingElement.cloneNode(true);

    audienceScore.id = 'mv-audience-score';
    audienceScore.children[0].textContent = 'AUDIENCE SCORE';

    audienceScore.children[1].title = `Open ${movie.info.title} on ${movie.pageName}`;
    audienceScore.children[1].href = movie.url;

    const scoreElement = audienceScore.querySelector(
      '[class|=AggregateRatingButton__Rating]'
    );

    scoreElement.children[0].textContent = `${movie.userRatings.score}%`;
    scoreElement.children[1].remove();

    const numberOfVotesElement = audienceScore.querySelector(
      '[class|=AggregateRatingButton__TotalRatingAmount]'
    );

    numberOfVotesElement.textContent = `${this._groupThousands(
      movie.userRatings.count
    )} votes`;

    const originalLogo = audienceScore.querySelector('svg');

    originalLogo.children[0].remove();

    const audienceLogo = document.createElementNS(
      originalLogo.namespaceURI,
      'image'
    );

    audienceLogo.setAttribute('width', '24px');
    audienceLogo.setAttribute('height', '24px');
    audienceLogo.setAttribute('href', movie.userRatings.custom);

    originalLogo.append(audienceLogo);

    userRatingElement.after(audienceScore);
  }

  _groupThousands(number) {
    return new Intl.NumberFormat(window.navigator.language).format(number);
  }

  _injectCriticsConsensus(doc, movie) {
    if (movie.summary) {
      const criticsList = doc.querySelector(
        '[class*=ReviewContent__StyledInlineList]'
      );

      const consensus = doc.createElement('li');

      consensus.title = `${movie.summary.title} from ${movie.pageName}`;
      consensus.innerHTML = `${movie.summary.title}: ${movie.summary.content}`;

      criticsList.append(consensus);
    }
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ImdbPage);
}
