/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class ImdbPage extends MoviePage {
  static get NAME() {
    return 'Imdb';
  }
  static get URL_PATTERN() {
    return /https:\/\/www\.imdb\.com\/title\/tt\d+\//;
  }

  /**
   * @return  {MovieData} movieData
   */
  async getMovieData() {
    const metaDataJSON = this.readMetadataJSON();

    if (metaDataJSON['@type'] != 'Movie') {
      throw new Error('Not a movie');
    }

    const title = metaDataJSON.name;
    const year = this.readYear();
    const criticRatings = await this.readCriticRatings();
    const userRatings = this.readUserRatings();
    const toplistPosition = this.getToplistPosition();

    return new MovieData(
      title,
      year,
      this.url,
      toplistPosition,
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
    const styleSheetUrl = this.getStylesheetUrl();

    const response = await fetch(styleSheetUrl);
    const css = await response.text();
    return css;
  }

  getStylesheetUrl() {
    const stylesheetLinkElements = this.document.querySelectorAll(
      'link[rel="stylesheet"]'
    );

    const styleSheetLinks = Array.from(stylesheetLinkElements).map(
      (linkElement) => linkElement.href
    );

    return styleSheetLinks.filter((link) => link.match(/title-flat/))[0];
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

  /**
   * @param  {MovieData} movieData
   */
  injectRatings(movieData) {
    this.injectTomatoMeter(this.document, movieData);

    this.injectAudienceScore(this.document, movieData);
  }

  injectTomatoMeter(doc, movieData) {
    const tomatoMeter = this.createTomatoMeterElement(movieData);
    const titleReviewBar = doc.getElementsByClassName('titleReviewBar')[0];

    if (!titleReviewBar) {
      this.addTomatometerWithNewReviewBar(doc, tomatoMeter);
    } else {
      this.addTomatometerToExistingReviewBar(doc, titleReviewBar, tomatoMeter);
    }
  }

  createTomatoMeterElement(movieData) {
    let tomatometerHtml;

    if (movieData.criticRatings) {
      tomatometerHtml = this.createFilledTomatometerHtml(movieData);
    } else {
      tomatometerHtml = this.createEmptyTomatometerHtml(movieData);
    }

    return this.generateElement(tomatometerHtml);
  }

  createFilledTomatometerHtml(movieData) {
    return (
      `<div class="titleReviewBarItem" id="mv-tomatometer">` +
      `    <a href="${movieData.url}" title="${movieData.title} on RottenTomatoes">` +
      `<img src="${movieData.criticRatings.custom}" height="27px" width="27px" style="vertical-align: baseline;">` +
      `<div class="metacriticScore titleReviewBarSubItem" style="width: 40px; color: black">` +
      `<span>${movieData.criticRatings.score}%</span>` +
      `        </div><div class="titleReviewBarSubItem">` +
      `            <div>Tomatometer</div>` +
      `            <div><span class="subText">Total Count: ${this.groupThousands(
        movieData.criticRatings.count
      )}</span></div>` +
      `        </div>` +
      `    </a>` +
      `</div>`
    );
  }

  createEmptyTomatometerHtml(movieData) {
    return (
      `<div class="titleReviewBarItem" id="mv-tomatometer">` +
      `    <a href="${movieData.url}" title="${movieData.title} on RottenTomatoes">` +
      `        <div class="metacriticScore score_tbd titleReviewBarSubItem" style="width: 40px">` +
      `            <span style="color:black">-</span>` +
      `        </div>` +
      `</a>` +
      `    <div class="titleReviewBarSubItem">` +
      `        <div>` +
      `            <a href="${movieData.url}">Tomatometer</a>` +
      `        </div>` +
      `        <div>` +
      `            <span class="subText">Total Count: N/A</span>` +
      `        </div>` +
      `    </div>` +
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

  injectAudienceScore(doc, movieData) {
    let ratingsWrapper = doc.getElementsByClassName('ratings_wrapper')[0];
    const audienceScoreElement = this.createAudienceScoreElement(movieData);

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
    ratingsWrapper.children[0].after(audienceScoreElem);
    audienceScoreElem.style.borderLeft = '1px solid #6b6b6b';
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

  createAudienceScoreElement(movieData) {
    let audienceScoreHtml;

    if (movieData.userRatings) {
      audienceScoreHtml = this.createFilledAudienceScoreHtml(movieData);
    } else {
      audienceScoreHtml = this.createEmptyAudienceScoreHtml(movieData.url);
    }

    return this.generateElement(audienceScoreHtml);
  }

  createFilledAudienceScoreHtml(movieData) {
    return (
      `<div class="imdbRating" id="mv-audience-score"` +
      `     style="background:none;text-align:center;padding:0px 10px 0px 5px;` +
      `width:100px;display:flex; align-items: center;">` +
      `<img src="${movieData.userRatings.custom}" height="27px" width="27px">` +
      `    <div>` +
      `        <div class="ratingValue">` +
      `            <strong title="Audience score from RottenTomatoes">` +
      `                <span itemprop="ratingValue">${movieData.userRatings.score}%</span>` +
      `            </strong>` +
      `        </div>` +
      `        <a href="${movieData.url}">` +
      `            <span class="small" itemprop="ratingCount">${this.groupThousands(
        movieData.userRatings.count
      )}</span>` +
      `        </a>` +
      `    </div>` +
      `</div>`
    );
  }

  createEmptyAudienceScoreHtml(url) {
    return (
      `<div class="imdbRating" id="mv-audience-score"` +
      `     style="background:none;text-align:center;padding:2px 0 0 2px;` +
      `width:90px;">` +
      `    <div class="ratingValue">` +
      `        <strong title="Audience score from RottenTomatoes">` +
      `            <span itemprop="ratingValue">-</span>` +
      `        </strong>` +
      `    </div>` +
      `    <a href="${url}">` +
      `        <span class="small" itemprop="ratingCount">N/A</span>` +
      `    </a>` +
      `</div>`
    );
  }

  groupThousands(number) {
    return new Intl.NumberFormat(window.navigator.language).format(number);
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(ImdbPage);
}
