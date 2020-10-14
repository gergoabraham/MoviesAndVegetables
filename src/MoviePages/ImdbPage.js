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
    const userRating = this.readUserRating();
    const numberOfUserVotes = this.readNumberOfUserVotes();
    const criticsRating = this.readCriticsRating();
    const numberOfCriticVotes = await this.readNumberOfCriticsVotes();
    const toplistPosition = this.getToplistPosition();
    const imdbLogo = this.getImdbLogo();
    const metacriticsColor = await this.getMetacriticsColor();

    return new MovieData(
      title,
      year,
      this.url,
      userRating,
      numberOfUserVotes,
      criticsRating,
      numberOfCriticVotes,
      toplistPosition,
      imdbLogo,
      metacriticsColor
    );
  }

  readYear() {
    return Number(this.getTitleMetaTag().match(/\d{4}(?=\) - IMDb)/)[0]);
  }

  readUserRating() {
    const userRatingElement = this.getUserRatingElement();

    return userRatingElement
      ? Number(userRatingElement.innerHTML.replace(',', '.'))
      : null;
  }

  getUserRatingElement() {
    return this.document.querySelector('span[itemprop="ratingValue"');
  }

  readNumberOfUserVotes() {
    const numberOfUserVotesElement = this.document.querySelector(
      'span[itemprop="ratingCount"'
    );

    return numberOfUserVotesElement
      ? Number(numberOfUserVotesElement.textContent.replace(/[^0-9]/g, ``))
      : null;
  }

  readCriticsRating() {
    const criticsRatingElement = this.getCriticsRatingElement();

    return criticsRatingElement
      ? Number(criticsRatingElement.querySelector('span').innerHTML)
      : null;
  }

  async readNumberOfCriticsVotes() {
    const criticsRatingElement = this.getCriticsRatingElement();

    return criticsRatingElement
      ? await this.fetchNumberOfCriticVotes(this.url)
      : null;
  }

  getCriticsRatingElement() {
    return this.document.querySelector('div.metacriticScore');
  }

  async fetchNumberOfCriticVotes(movieUrl) {
    const criticUrl = movieUrl + 'criticreviews';
    const criticsPage = await this.fetchPage(criticUrl);

    const numberOfCriticVotes = criticsPage.querySelector(
      'span[itemprop="ratingCount"'
    ).textContent;

    return Number(numberOfCriticVotes);
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

  getImdbLogo() {
    return this.getUserRatingElement()
      ? this.document.getElementById('home_img').outerHTML
      : null;
  }

  async getMetacriticsColor() {
    let color = null;
    const criticsRating = this.getCriticsRatingElement();

    if (criticsRating) {
      const css = await this.fetchCss();
      const favorableness = criticsRating.className.match(/score_\w+/)[0];

      color = css.match(
        `\\.${favorableness}{background-color:(#[a-zA-Z0-9]{6})`
      )[1];
    }

    return color;
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

  async fetchPage(url) {
    const response = await fetch(url);
    const pageText = await response.text();

    return new DOMParser().parseFromString(pageText, 'text/html');
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

    if (movieData.criticsRating) {
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
      `<img src="${movieData.criticsRatingColor}" height="27px" width="27px" style="vertical-align: baseline;">` +
      `<div class="metacriticScore titleReviewBarSubItem" style="width: 40px; color: black">` +
      `<span>${movieData.criticsRating}%</span>` +
      `        </div><div class="titleReviewBarSubItem">` +
      `            <div>Tomatometer</div>` +
      `            <div><span class="subText">Total Count: ${this.groupThousands(
        movieData.numberOfCriticsVotes
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

    if (movieData.userRating) {
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
      `<img src="${movieData.userRatingLogo}" height="27px" width="27px">` +
      `    <div>` +
      `        <div class="ratingValue">` +
      `            <strong title="Audience score from RottenTomatoes">` +
      `                <span itemprop="ratingValue">${movieData.userRating}%</span>` +
      `            </strong>` +
      `        </div>` +
      `        <a href="${movieData.url}">` +
      `            <span class="small" itemprop="ratingCount">${this.groupThousands(
        movieData.numberOfUserVotes
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
