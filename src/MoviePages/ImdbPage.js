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

    return new MovieData(
      title,
      year,
      this.url,
      userRating,
      numberOfUserVotes,
      criticsRating,
      numberOfCriticVotes,
      toplistPosition
    );
  }

  readYear() {
    return Number(this.getTitleMetaTag().match(/\d{4}(?=\) - IMDb)/)[0]);
  }

  readUserRating() {
    const userRatingElement = this.document.querySelector(
      'span[itemprop="ratingValue"'
    );

    return userRatingElement
      ? Number(userRatingElement.innerHTML.replace(',', '.'))
      : null;
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

  async fetchPage(url) {
    const response = await fetch(url);
    const pageText = await response.text();

    return new DOMParser().parseFromString(pageText, 'text/html');
  }

  /**
   * @param  {MovieData} movieData
   */
  injectRatings(movieData) {
    this.injectTomatoMeter(
      this.document,
      movieData.criticsRating,
      movieData.url,
      movieData.numberOfCriticsVotes
    );

    this.injectAudienceScore(
      this.document,
      movieData.userRating,
      movieData.url,
      movieData.numberOfUserVotes
    );
  }

  injectTomatoMeter(doc, percent, url, votes) {
    const tomatoMeter = this.createTomatoMeterElement(url, percent, votes);
    const titleReviewBar = doc.getElementsByClassName('titleReviewBar')[0];

    if (!titleReviewBar) {
      this.addTomatometerWithNewReviewBar(doc, tomatoMeter);
    } else {
      this.addTomatometerToExistingReviewBar(doc, titleReviewBar, tomatoMeter);
    }
  }

  createTomatoMeterElement(url, percent, votes) {
    return this.generateElement(
      `<div class="titleReviewBarItem" id="mv-tomatometer">` +
        `    <a href="${url}">` +
        `        <div class="metacriticScore ${this.getFavorableness(
          percent
        )} titleReviewBarSubItem" style="width: 40px">` +
        `            <span>${percent ? percent + '%' : 'TBD'}</span>` +
        `        </div>` +
        `    </a>` +
        `    <div class="titleReviewBarSubItem">` +
        `        <div>` +
        `            <a href="${url}">Tomatometer</a>` +
        `        </div>` +
        `        <div>` +
        `            <span class="subText">Total Count: ${
          votes ? this.groupThousands(votes) : 'N/A'
        }</span>` +
        `        </div>` +
        `    </div>` +
        `</div>`
    );
  }

  getFavorableness(percent) {
    let favorableness;

    if (percent === null) {
      favorableness = 'tbd';
    } else if (percent >= 61) {
      favorableness = 'favorable';
    } else if (percent >= 41) {
      favorableness = 'mixed';
    } else {
      favorableness = 'unfavorable';
    }

    return `score_${favorableness}`;
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

  injectAudienceScore(doc, percent, url, votes) {
    let ratingsWrapper = doc.getElementsByClassName('ratings_wrapper')[0];
    const audienceScoreElement = this.createAudienceScoreElement(
      percent,
      url,
      votes
    );

    if (ratingsWrapper) {
      this.addAudienceScoreToExistingRatingsWrapper(doc, audienceScoreElement);
    } else {
      ratingsWrapper = this.addAudienceScoreToNewRatingsWrapper(
        doc,
        audienceScoreElement
      );
    }

    ratingsWrapper.style.width = 'auto';
  }

  addAudienceScoreToExistingRatingsWrapper(doc, audienceScoreElement) {
    const starRatingWidget = doc.getElementById('star-rating-widget');
    starRatingWidget.before(audienceScoreElement);

    audienceScoreElement.style.borderLeft = '1px solid #6b6b6b';
    this.fixUserScoreWidth(audienceScoreElement);
  }

  fixUserScoreWidth(audienceScoreElement) {
    const imdbRating = audienceScoreElement.previousElementSibling;
    imdbRating.setAttribute('style', 'width:95px');
  }

  addAudienceScoreToNewRatingsWrapper(doc, audienceScoreElement) {
    const newRatingsWrapper = doc.createElement('div');
    newRatingsWrapper.className = 'ratings_wrapper';

    const titleBarWrapper = doc.getElementsByClassName('title_bar_wrapper')[0];
    titleBarWrapper.prepend(newRatingsWrapper);

    newRatingsWrapper.appendChild(audienceScoreElement);

    return newRatingsWrapper;
  }

  createAudienceScoreElement(percent, url, votes) {
    return this.generateElement(
      `<div class="imdbRating" id="mv-audience-score"` +
        `     style="background:none;text-align:center;padding:2px 0 0 2px;` +
        `width:90px;">` +
        `    <div class="ratingValue">` +
        `        <strong title="Audience score from RottenTomatoes">` +
        `            <span itemprop="ratingValue">${
          percent ? percent + '%' : 'TBD'
        }</span>` +
        `        </strong>` +
        `    </div>` +
        `    <a href="${url}">` +
        `        <span class="small" itemprop="ratingCount">${
          votes ? this.groupThousands(votes) : 'N/A'
        }</span>` +
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
