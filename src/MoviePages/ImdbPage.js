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
    const criticRatings = await this._readCriticRatings();
    const userRatings = this._readUserRatings();
    const toplistPosition = this._getToplistPosition();
    const summary = this._readSummary();

    return new MovieInfoWithRatings(
      await this.getMovieInfo(),
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
    const styleSheetUrl = this._getStylesheetUrl(/title-flat.*\.css$/);

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
    const tomatoMeter = this._createTomatoMeterElement(movie);
    const titleReviewBar = doc.getElementsByClassName('titleReviewBar')[0];

    if (!titleReviewBar) {
      this._addTomatometerWithNewReviewBar(doc, tomatoMeter);
    } else {
      this._addTomatometerToExistingReviewBar(doc, titleReviewBar, tomatoMeter);
    }
  }

  _createTomatoMeterElement(movie) {
    let tomatometerHtml;

    if (movie.criticRatings) {
      tomatometerHtml = this._createFilledTomatometerHtml(movie);
    } else {
      tomatometerHtml = this._createEmptyTomatometerHtml(movie);
    }

    return this._generateElement(tomatometerHtml);
  }

  _createFilledTomatometerHtml(movie) {
    const iconLogo = movie.criticRatings.custom
      ? `<img src="${movie.criticRatings.custom}" height="27px" width="27px" style="vertical-align: baseline">`
      : '';

    return (
      `<div class="titleReviewBarItem" id="mv-tomatometer" style="margin-bottom: 18px">` +
      `    <a href="${movie.url}" title="Open ${movie.info.title} on ${movie.pageName}" style="text-decoration: none">` +
      `        ${iconLogo}` +
      `        <div class="metacriticScore titleReviewBarSubItem" style="color: black; width: auto;">` +
      `            <span>${movie.criticRatings.score}%</span>` +
      `        </div>` +
      `        <div class="titleReviewBarSubItem">` +
      `            <div>Tomatometer</div>` +
      `            <div>` +
      `                <span class="subText">Total Count: ${this._groupThousands(
        movie.criticRatings.count
      )}</span>` +
      `            </div>` +
      `        </div>` +
      `    </a>` +
      `</div>`
    );
  }

  _createEmptyTomatometerHtml(movie) {
    return (
      `<div class="titleReviewBarItem" id="mv-tomatometer">` +
      `    <a href="${movie.url}" title="Open ${movie.info.title} on ${movie.pageName}" style="text-decoration: none;">` +
      `        <div class="metacriticScore titleReviewBarSubItem" style="color: black">` +
      `            <span style="color: black;">-</span>` +
      `        </div>` +
      `        <div class="titleReviewBarSubItem">` +
      `            <div>Tomatometer</div>` +
      `            <div>` +
      `                <span class="subText">Total Count: N/A</span>` +
      `            </div>` +
      `        </div>` +
      `    </a>` +
      `</div>`
    );
  }

  _addTomatometerWithNewReviewBar(doc, newTomatoMeter) {
    const plotSummaryWrapper = doc.getElementsByClassName(
      'plot_summary_wrapper'
    )[0];
    const newTitleReviewBar = this._createEmptyTitleReviewBar(doc);

    plotSummaryWrapper.appendChild(newTitleReviewBar);
    newTitleReviewBar.appendChild(newTomatoMeter);
  }

  _createEmptyTitleReviewBar(doc) {
    const titleReviewBar = doc.createElement('div');

    titleReviewBar.className = 'titleReviewBar';

    return titleReviewBar;
  }

  _addTomatometerToExistingReviewBar(doc, titleReviewBar, newTomatoMeter) {
    const newDivider = this._createDividerElement(doc);
    const firstItem = titleReviewBar.children[0];

    if (this._isItMetascore(firstItem)) {
      firstItem.after(newTomatoMeter);
      newTomatoMeter.before(newDivider);
    } else {
      titleReviewBar.prepend(newTomatoMeter);
      newTomatoMeter.after(newDivider);
    }

    this._makeTitleReviewBarWrappable(titleReviewBar);
  }

  _makeTitleReviewBarWrappable(titleReviewBar) {
    titleReviewBar.style.height = 'auto';
    titleReviewBar.style.paddingBottom = '0px';

    titleReviewBar.lastElementChild.style.marginBottom = '18px';
  }

  _createDividerElement(doc) {
    const newDivider = doc.createElement('div');

    newDivider.className = 'divider';

    return newDivider;
  }

  _isItMetascore(element) {
    return element.getElementsByClassName('metacriticScore')[0];
  }

  _injectAudienceScore(doc, movie) {
    let ratingsWrapper = doc.getElementsByClassName('ratings_wrapper')[0];
    const audienceScoreElement = this._createAudienceScoreElement(movie);

    if (ratingsWrapper) {
      this._addAudienceScoreToExistingRatingsWrapper(
        ratingsWrapper,
        audienceScoreElement
      );
    } else {
      ratingsWrapper = this._addAudienceScoreToNewRatingsWrapper(
        doc,
        audienceScoreElement
      );
    }

    ratingsWrapper.style.width = 'auto';
  }

  _addAudienceScoreToExistingRatingsWrapper(ratingsWrapper, audienceScoreElem) {
    audienceScoreElem.style.borderLeft = '1px solid #6b6b6b';
    ratingsWrapper.children[0].after(audienceScoreElem);

    this._fixUserScoreWidth(ratingsWrapper);
  }

  _fixUserScoreWidth(ratingsWrapper) {
    const imdbRating = ratingsWrapper.children[0];

    imdbRating.style.width = '95px';
  }

  _addAudienceScoreToNewRatingsWrapper(doc, audienceScoreElement) {
    const newRatingsWrapper = doc.createElement('div');

    newRatingsWrapper.className = 'ratings_wrapper';

    const titleBarWrapper = doc.getElementsByClassName('title_bar_wrapper')[0];

    titleBarWrapper.prepend(newRatingsWrapper);

    newRatingsWrapper.appendChild(audienceScoreElement);

    return newRatingsWrapper;
  }

  _createAudienceScoreElement(movie) {
    let audienceScoreHtml;

    if (movie.userRatings) {
      audienceScoreHtml = this._createFilledAudienceScoreHtml(movie);
    } else {
      audienceScoreHtml = this._createEmptyAudienceScoreHtml(movie);
    }

    return this._generateElement(audienceScoreHtml);
  }

  _createFilledAudienceScoreHtml(movie) {
    const iconLogo = movie.userRatings.custom
      ? `<img src="${movie.userRatings.custom}" height="32px" width="32px">`
      : '';

    return (
      `<div class="imdbRating" id="mv-audience-score" style="background: none; text-align: center; padding: 0px; width: 100px">` +
      `    <a href="${movie.url}" title="Open ${movie.info.title} on ${movie.pageName}" style="text-decoration: none">` +
      `        <div style="display: flex; align-items: center; justify-content: center; height: 40px;">` +
      `            ${iconLogo}` +
      `            <div>` +
      `                <div class="ratingValue">` +
      `                    <strong style="color: white">` +
      `                        <span itemprop="ratingValue">${movie.userRatings.score}%</span>` +
      `                    </strong>` +
      `                </div>` +
      `                <span class="small" itemprop="ratingCount">${this._groupThousands(
        movie.userRatings.count
      )}</span>` +
      `            </div>` +
      `        </div>` +
      `    </a>` +
      `</div>`
    );
  }

  _createEmptyAudienceScoreHtml(movie) {
    return (
      `<div class="imdbRating" id="mv-audience-score" style="background: none; text-align: center;padding-left: 0px; width: 90px;">` +
      `    <a href="${movie.url}" title="Open ${movie.info.title} on ${movie.pageName}" style="text-decoration: none;">` +
      `        <div class="ratingValue">` +
      `            <strong>` +
      `                <span itemprop="ratingValue">-</span>` +
      `            </strong>` +
      `        </div>` +
      `        <span class="small" itemprop="ratingCount">N/A</span>` +
      `    </a>` +
      `</div>`
    );
  }

  _groupThousands(number) {
    return new Intl.NumberFormat(window.navigator.language).format(number);
  }

  _injectCriticsConsensus(doc, movie) {
    if (movie.summary) {
      const consensus = this._generateElement(
        `<div` +
          `  id="mv-critics-consensus"` +
          `  title="${movie.summary.title} from ${movie.pageName}"` +
          `  style="padding: 0px 20px 18px 20px; display: flex; align-items: center">` +
          `  <h4 style="padding-right: 20px">${movie.summary.title}:</h4>` +
          `  <div>${movie.summary.content}</div>` +
          `</div>`
      );

      doc.getElementsByClassName('titleReviewBar')[0].after(consensus);
    }
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ImdbPage);
}
