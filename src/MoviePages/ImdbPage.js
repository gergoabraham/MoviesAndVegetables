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

  /**
   * @return  {MovieInfo} movie
   */
  async getMovieInfo() {
    const metaDataJSON = this.readMetadataJSON();

    if (metaDataJSON['@type'] != 'Movie') {
      throw new Error('Not a movie');
    }

    const title = metaDataJSON.name;
    const year = this.readYear();

    return new MovieInfo(title, year);
  }

  /**
   * @return  {MovieInfoWithRatings} movie
   */
  async getMovieInfoWithRatings() {
    const criticRatings = await this.readCriticRatings();
    const userRatings = this.readUserRatings();
    const toplistPosition = this.getToplistPosition();
    const summary = this.readSummary();

    return new MovieInfoWithRatings(
      await this.getMovieInfo(),
      this.url,
      ImdbPage.NAME,
      toplistPosition,
      summary,
      criticRatings,
      userRatings
    );
  }

  readYear() {
    return Number(this.getTitleMetaTag().match(/\d{4}(?=\) - IMDb)/)[0]);
  }

  async readCriticRatings() {
    const metascore = this.readMetascore();

    return metascore
      ? new Ratings(
          metascore,
          await this.readCriticReviewCount(),
          await this.getMetascoreColor()
        )
      : null;
  }

  readMetascore() {
    const metascoreElement = this.getMetascoreElement();

    return metascoreElement
      ? Number(metascoreElement.querySelector('span').innerHTML)
      : null;
  }

  async readCriticReviewCount() {
    const criticUrl = this.url + 'criticreviews';
    const criticsPage = await this.fetchDOM(criticUrl);

    const numberOfCriticRatings = criticsPage.querySelector(
      'span[itemprop="ratingCount"'
    ).textContent;

    return Number(numberOfCriticRatings);
  }

  async fetchDOM(url) {
    const response = await fetch(url);
    const pageText = await response.text();
    Logger.logFetch(url, pageText);

    return new DOMParser().parseFromString(pageText, 'text/html');
  }

  async getMetascoreColor() {
    const metascoreElement = this.getMetascoreElement();

    const css = await this.fetchCss();
    const favorableness = metascoreElement.className.match(/score_\w+/)[0];

    return css.match(
      `\\.${favorableness}{background-color:(#[a-zA-Z0-9]{6})`
    )[1];
  }

  getMetascoreElement() {
    return this.document.querySelector('div.metacriticScore');
  }

  async fetchCss() {
    const styleSheetUrl = this.getStylesheetUrl(/title-flat.*\.css$/);

    return ImdbPage.fetchTextContent(styleSheetUrl);
  }

  readUserRatings() {
    const userRatings = this.readUserScore();

    return userRatings
      ? new Ratings(
          userRatings,
          this.readNumberOfUserRatings(),
          this.getImdbLogo()
        )
      : null;
  }

  readUserScore() {
    const userRatingElement = this.document.querySelector(
      'span[itemprop="ratingValue"]'
    );

    return userRatingElement
      ? Number(userRatingElement.innerHTML.replace(',', '.'))
      : null;
  }

  readNumberOfUserRatings() {
    const numberOfUserRatingsElement = this.document.querySelector(
      'span[itemprop="ratingCount"]'
    );

    return Number(
      numberOfUserRatingsElement.textContent.replace(/[^0-9]/g, ``)
    );
  }

  getImdbLogo() {
    return this.document.getElementById('home_img').outerHTML;
  }

  getToplistPosition() {
    const toplistPositionElement = this.document.querySelector(
      'a[href="/chart/top?ref_=tt_awd"'
    );
    const toplistPosition = toplistPositionElement
      ? Number(toplistPositionElement.textContent.match(/\d{1,3}/g)[0])
      : null;

    return toplistPosition;
  }

  readSummary() {
    const plotSummaryElement = this.document.querySelector('div.summary_text');

    const summary = plotSummaryElement
      ? new Summary('Summary', plotSummaryElement.textContent.trim())
      : null;
    return summary;
  }

  /**
   * @param  {MovieInfoWithRatings} movie
   */
  injectRatings(movie) {
    this.injectTomatoMeter(this.document, movie);
    this.injectAudienceScore(this.document, movie);
    this.injectCriticsConsensus(this.document, movie);
  }

  injectTomatoMeter(doc, movie) {
    const tomatoMeter = this.createTomatoMeterElement(movie);
    const titleReviewBar = doc.getElementsByClassName('titleReviewBar')[0];

    if (!titleReviewBar) {
      this.addTomatometerWithNewReviewBar(doc, tomatoMeter);
    } else {
      this.addTomatometerToExistingReviewBar(doc, titleReviewBar, tomatoMeter);
    }
  }

  createTomatoMeterElement(movie) {
    let tomatometerHtml;

    if (movie.criticRatings) {
      tomatometerHtml = this.createFilledTomatometerHtml(movie);
    } else {
      tomatometerHtml = this.createEmptyTomatometerHtml(movie);
    }

    return this.generateElement(tomatometerHtml);
  }

  createFilledTomatometerHtml(movie) {
    return (
      `<div class="titleReviewBarItem" id="mv-tomatometer">` +
      `    <a href="${movie.url}" title="Open ${movie.info.title} on ${movie.pageName}" style="text-decoration: none">` +
      `        <img src="${movie.criticRatings.custom}" height="27px" width="27px" style="vertical-align: baseline">` +
      `        <div class="metacriticScore titleReviewBarSubItem" style="color: black">` +
      `            <span>${movie.criticRatings.score}%</span>` +
      `        </div>` +
      `        <div class="titleReviewBarSubItem">` +
      `            <div>Tomatometer</div>` +
      `            <div>` +
      `                <span class="subText">Total Count: ${this.groupThousands(
        movie.criticRatings.count
      )}</span>` +
      `            </div>` +
      `        </div>` +
      `    </a>` +
      `</div>`
    );
  }

  createEmptyTomatometerHtml(movie) {
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

  addTomatometerWithNewReviewBar(doc, newTomatoMeter) {
    const plotSummaryWrapper = doc.getElementsByClassName(
      'plot_summary_wrapper'
    )[0];
    const newTitleReviewBar = this.createEmptyTitleReviewBar(doc);

    plotSummaryWrapper.appendChild(newTitleReviewBar);
    newTitleReviewBar.appendChild(newTomatoMeter);
  }

  createEmptyTitleReviewBar(doc) {
    const titleReviewBar = doc.createElement('div');
    titleReviewBar.className = 'titleReviewBar';
    return titleReviewBar;
  }

  addTomatometerToExistingReviewBar(doc, titleReviewBar, newTomatoMeter) {
    const newDivider = this.createDividerElement(doc);
    const firstItem = titleReviewBar.children[0];

    if (this.isItMetascore(firstItem)) {
      firstItem.after(newTomatoMeter);
      newTomatoMeter.before(newDivider);
    } else {
      titleReviewBar.prepend(newTomatoMeter);
      newTomatoMeter.after(newDivider);
    }
  }

  createDividerElement(doc) {
    const newDivider = doc.createElement('div');
    newDivider.className = 'divider';
    return newDivider;
  }

  isItMetascore(element) {
    return element.getElementsByClassName('metacriticScore')[0];
  }

  injectAudienceScore(doc, movie) {
    let ratingsWrapper = doc.getElementsByClassName('ratings_wrapper')[0];
    const audienceScoreElement = this.createAudienceScoreElement(movie);

    if (ratingsWrapper) {
      this.addAudienceScoreToExistingRatingsWrapper(
        ratingsWrapper,
        audienceScoreElement
      );
    } else {
      ratingsWrapper = this.addAudienceScoreToNewRatingsWrapper(
        doc,
        audienceScoreElement
      );
    }

    ratingsWrapper.style.width = 'auto';
  }

  addAudienceScoreToExistingRatingsWrapper(ratingsWrapper, audienceScoreElem) {
    audienceScoreElem.style.borderLeft = '1px solid #6b6b6b';
    ratingsWrapper.children[0].after(audienceScoreElem);

    this.fixUserScoreWidth(ratingsWrapper);
  }

  fixUserScoreWidth(ratingsWrapper) {
    const imdbRating = ratingsWrapper.children[0];
    imdbRating.style.width = '95px';
  }

  addAudienceScoreToNewRatingsWrapper(doc, audienceScoreElement) {
    const newRatingsWrapper = doc.createElement('div');
    newRatingsWrapper.className = 'ratings_wrapper';

    const titleBarWrapper = doc.getElementsByClassName('title_bar_wrapper')[0];
    titleBarWrapper.prepend(newRatingsWrapper);

    newRatingsWrapper.appendChild(audienceScoreElement);

    return newRatingsWrapper;
  }

  createAudienceScoreElement(movie) {
    let audienceScoreHtml;

    if (movie.userRatings) {
      audienceScoreHtml = this.createFilledAudienceScoreHtml(movie);
    } else {
      audienceScoreHtml = this.createEmptyAudienceScoreHtml(movie);
    }

    return this.generateElement(audienceScoreHtml);
  }

  createFilledAudienceScoreHtml(movie) {
    return (
      `<div class="imdbRating" id="mv-audience-score" style="background: none; text-align: center; padding: 0px; width: 100px">` +
      `    <a href="${movie.url}" title="Open ${movie.info.title} on ${movie.pageName}" style="text-decoration: none">` +
      `        <div style="display: flex; align-items: center; justify-content: center; height: 40px;">` +
      `            <img src="${movie.userRatings.custom}" height="32px" width="32px">` +
      `            <div>` +
      `                <div class="ratingValue">` +
      `                    <strong style="color: white">` +
      `                        <span itemprop="ratingValue">${movie.userRatings.score}%</span>` +
      `                    </strong>` +
      `                </div>` +
      `                <span class="small" itemprop="ratingCount">${this.groupThousands(
        movie.userRatings.count
      )}</span>` +
      `            </div>` +
      `        </div>` +
      `    </a>` +
      `</div>`
    );
  }

  createEmptyAudienceScoreHtml(movie) {
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

  groupThousands(number) {
    return new Intl.NumberFormat(window.navigator.language).format(number);
  }

  injectCriticsConsensus(doc, movie) {
    if (movie.summary) {
      const consensus = this.generateElement(
        `<div id="mv-critics-consensus">` +
          `<a` +
          ` href="${movie.url}"` +
          ` title="Open ${movie.info.title} on ${movie.pageName}"` +
          ` style="text-decoration: none; color: #333"` +
          `>` +
          `  <div style="padding: 0px 20px 18px 20px; display: flex; align-items: center">` +
          `    <h4 style="padding-right: 20px">${movie.summary.title}:</h4>` +
          `    <div>${movie.summary.content}</div>` +
          `  </div>` +
          `</a>` +
          `</div>`
      );

      doc.getElementsByClassName('titleReviewBar')[0].after(consensus);
    }
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ImdbPage);
}
