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

    const title = metaDataJSON.name.replace(/&\w+;/, '+');
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
    const isNewTitlePage = !!document.querySelector(
      '[class*=TitleBlock__Container]'
    );

    if (isNewTitlePage) {
      this._injectRatingsIntoNewPage(movie);
    } else {
      this._injectRatingsIntoOldPage(movie);
    }
  }

  _injectRatingsIntoNewPage(movie) {
    this._injectTomatoMeter(this._document, movie);
    this._injectAudienceScore(this._document, movie);
    this._injectCriticsConsensus(this._document, movie);
  }

  _injectTomatoMeter(doc, movie) {
    if (!movie.criticRatings) return;

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
    if (!movie.userRatings) return;

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

      const consensus = this._generateElement(`
        <li>${movie.summary.title}: ${movie.summary.content}</li>
        `);

      consensus.title = `${movie.summary.title} from ${movie.pageName}`;

      criticsList.append(consensus);
    }
  }

  // -------------- OLD PAGE --------------------------------------------------
  _injectRatingsIntoOldPage(movie) {
    this._old_injectTomatoMeter(this._document, movie);
    this._old_injectAudienceScore(this._document, movie);
    this._old_injectCriticsConsensus(this._document, movie);
  }

  _old_injectTomatoMeter(doc, movie) {
    const tomatoMeter = this._old_createTomatoMeterElement(movie);
    const titleReviewBar = doc.getElementsByClassName('titleReviewBar')[0];

    if (!titleReviewBar) {
      this._old_addTomatometerWithNewReviewBar(doc, tomatoMeter);
    } else {
      this._old_addTomatometerToExistingReviewBar(
        doc,
        titleReviewBar,
        tomatoMeter
      );
    }
  }

  _old_createTomatoMeterElement(movie) {
    let tomatometerHtml;

    if (movie.criticRatings) {
      tomatometerHtml = this._old_createFilledTomatometerHtml(movie);
    } else {
      tomatometerHtml = this._old_createEmptyTomatometerHtml(movie);
    }

    return this._generateElement(tomatometerHtml);
  }

  _old_createFilledTomatometerHtml(movie) {
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
      `                <span class="subText">Total Count: ${this._old_groupThousands(
        movie.criticRatings.count
      )}</span>` +
      `            </div>` +
      `        </div>` +
      `    </a>` +
      `</div>`
    );
  }

  _old_createEmptyTomatometerHtml(movie) {
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

  _old_addTomatometerWithNewReviewBar(doc, newTomatoMeter) {
    const plotSummaryWrapper = doc.getElementsByClassName(
      'plot_summary_wrapper'
    )[0];
    const newTitleReviewBar = this._old_createEmptyTitleReviewBar(doc);

    plotSummaryWrapper.appendChild(newTitleReviewBar);
    newTitleReviewBar.appendChild(newTomatoMeter);
  }

  _old_createEmptyTitleReviewBar(doc) {
    const titleReviewBar = doc.createElement('div');

    titleReviewBar.className = 'titleReviewBar';

    return titleReviewBar;
  }

  _old_addTomatometerToExistingReviewBar(doc, titleReviewBar, newTomatoMeter) {
    const newDivider = this._old_createDividerElement(doc);
    const firstItem = titleReviewBar.children[0];

    if (this._old_isItMetascore(firstItem)) {
      firstItem.after(newTomatoMeter);
      newTomatoMeter.before(newDivider);
    } else {
      titleReviewBar.prepend(newTomatoMeter);
      newTomatoMeter.after(newDivider);
    }

    this._old_makeTitleReviewBarWrappable(titleReviewBar);
  }

  _old_makeTitleReviewBarWrappable(titleReviewBar) {
    titleReviewBar.style.height = 'auto';
    titleReviewBar.style.paddingBottom = '0px';

    titleReviewBar.lastElementChild.style.marginBottom = '18px';
  }

  _old_createDividerElement(doc) {
    const newDivider = doc.createElement('div');

    newDivider.className = 'divider';

    return newDivider;
  }

  _old_isItMetascore(element) {
    return element.getElementsByClassName('metacriticScore')[0];
  }

  _old_injectAudienceScore(doc, movie) {
    let ratingsWrapper = doc.getElementsByClassName('ratings_wrapper')[0];
    const audienceScoreElement = this._old_createAudienceScoreElement(movie);

    if (ratingsWrapper) {
      this._old_addAudienceScoreToExistingRatingsWrapper(
        ratingsWrapper,
        audienceScoreElement
      );
    } else {
      ratingsWrapper = this._old_addAudienceScoreToNewRatingsWrapper(
        doc,
        audienceScoreElement
      );
    }

    ratingsWrapper.style.width = 'auto';
  }

  _old_addAudienceScoreToExistingRatingsWrapper(
    ratingsWrapper,
    audienceScoreElem
  ) {
    audienceScoreElem.style.borderLeft = '1px solid #6b6b6b';
    ratingsWrapper.children[0].after(audienceScoreElem);

    this._old_fixUserScoreWidth(ratingsWrapper);
  }

  _old_fixUserScoreWidth(ratingsWrapper) {
    const imdbRating = ratingsWrapper.children[0];

    imdbRating.style.width = '95px';
  }

  _old_addAudienceScoreToNewRatingsWrapper(doc, audienceScoreElement) {
    const newRatingsWrapper = doc.createElement('div');

    newRatingsWrapper.className = 'ratings_wrapper';

    const titleBarWrapper = doc.getElementsByClassName('title_bar_wrapper')[0];

    titleBarWrapper.prepend(newRatingsWrapper);

    newRatingsWrapper.appendChild(audienceScoreElement);

    return newRatingsWrapper;
  }

  _old_createAudienceScoreElement(movie) {
    let audienceScoreHtml;

    if (movie.userRatings) {
      audienceScoreHtml = this._old_createFilledAudienceScoreHtml(movie);
    } else {
      audienceScoreHtml = this._old_createEmptyAudienceScoreHtml(movie);
    }

    return this._generateElement(audienceScoreHtml);
  }

  _old_createFilledAudienceScoreHtml(movie) {
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
      `                <span class="small" itemprop="ratingCount">${this._old_groupThousands(
        movie.userRatings.count
      )}</span>` +
      `            </div>` +
      `        </div>` +
      `    </a>` +
      `</div>`
    );
  }

  _old_createEmptyAudienceScoreHtml(movie) {
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

  _old_groupThousands(number) {
    return new Intl.NumberFormat(window.navigator.language).format(number);
  }

  _old_injectCriticsConsensus(doc, movie) {
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
  // -------------- OLD PAGE above ---------------------------------------------
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ImdbPage);
}
