/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class RottenPage extends MoviePage {
  static get NAME() {
    return 'RottenTomatoes';
  }

  static get URL_PATTERN() {
    return /https:\/\/www\.rottentomatoes\.com\/m\/[^&]+/;
  }

  /**
   * @return  {MovieData} movieData
   */
  async getMovieData() {
    const metaDataJSON = this.readMetadataJSON();

    const title = metaDataJSON.name;
    const year = this.readYear();

    const tomatometer = await this.readTomatometerStuff();
    const audienceScore = await this.readAudienceScoreStuff();

    return new MovieData(
      title,
      year,
      this.url,
      null,
      tomatometer,
      audienceScore
    );
  }

  readYear() {
    return Number(this.getTitleMetaTag().match(/\d{4}(?=\)$)/));
  }

  async readTomatometerStuff() {
    const tomatometerValue = this.readTomatoMeter();

    return tomatometerValue
      ? new MovieRating(
          tomatometerValue,
          this.readNumberOfCriticsVotes(),
          await this.readTomatometerLogoUrl()
        )
      : null;
  }

  readTomatoMeter() {
    return this.readScore(0);
  }

  readNumberOfCriticsVotes() {
    return Number(
      this.document.body
        .getElementsByClassName('mop-ratings-wrap__half')[0]
        .querySelectorAll('small.mop-ratings-wrap__text--small')[0]
        .textContent.replace(/[^0-9]/g, '')
    );
  }

  async readTomatometerLogoUrl() {
    const freshness = this.readTomatometerFreshness();
    return this.readLogoUrl(freshness);
  }

  readTomatometerFreshness() {
    const tomatometerIcon = this.document
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .querySelector('span.mop-ratings-wrap__icon.meter-tomato');

    return tomatometerIcon.className.match(/(certified.fresh|fresh|rotten)/)[0];
  }

  async readAudienceScoreStuff() {
    const audienceScoreValue = this.readAudienceScore();

    return audienceScoreValue
      ? new MovieRating(
          audienceScoreValue,
          this.readNumberOfUserVotes(),
          await this.readAudienceScoreLogoUrl()
        )
      : null;
  }

  readAudienceScore() {
    return this.readScore(1);
  }

  readScore(i) {
    const audienceScoreElement = this.document.body
      .getElementsByClassName('mop-ratings-wrap__half')
      [i].getElementsByClassName('mop-ratings-wrap__percentage')[0];

    return audienceScoreElement
      ? Number(audienceScoreElement.innerHTML.replace(/[^0-9]/g, ''))
      : null;
  }

  readNumberOfUserVotes() {
    return Number(
      this.document.body
        .getElementsByClassName('mop-ratings-wrap__half')[1]
        .querySelectorAll('strong.mop-ratings-wrap__text--small')[0]
        .textContent.replace(/[^0-9]/g, '')
    );
  }

  async readAudienceScoreLogoUrl() {
    const freshness = this.readAudienceScoreFreshness();
    return this.readLogoUrl(freshness);
  }

  readAudienceScoreFreshness() {
    const freshnessIcon = this.document
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .querySelector('span.mop-ratings-wrap__icon.meter-tomato');

    return freshnessIcon.className.match(/(upright|spilled)/)[0];
  }

  async readLogoUrl(freshness) {
    const css = await this.fetchCachedCss();
    const relativeIconUrl = this.findLogoUrlInCss(css, freshness);

    return this.convertToAbsoluteUrl(relativeIconUrl);
  }

  async fetchCachedCss() {
    this.css = this.css || (await this.fetchCss());

    return this.css;
  }

  async fetchCss() {
    const stylesheetLinkElements = this.document.querySelectorAll(
      'link[as="style"]'
    );

    const styleSheetLinks = Array.from(stylesheetLinkElements).map(
      (linkElement) => linkElement.href
    );

    const matchedStyleSheets = styleSheetLinks.filter((link) =>
      link.match(/global.*\.css/)
    );

    const relativeUrl = matchedStyleSheets[0].match('/assets.+');
    const styleSheetUrl = this.convertToAbsoluteUrl(relativeUrl);
    const cssResponse = await fetch(styleSheetUrl);

    return cssResponse.text();
  }

  findLogoUrlInCss(css, freshness) {
    return css.match(
      new RegExp(
        `\\.icon\\.big\\.${freshness}[^{]*{background:transparent url\\(([^)]+)`,
        'i'
      )
    )[1];
  }

  convertToAbsoluteUrl(relativeUrl) {
    return 'https://www.rottentomatoes.com' + relativeUrl;
  }

  /**
   * @param  {MovieData} movieData
   */
  injectRatings(movieData) {
    this.fixCenterAlignmentOfTomatoMeterAndAudienceScore();

    const imdbScoreElement = this.generateImdbRatingsRowElement(movieData);
    const scoreboardContainers = this.document.querySelectorAll(
      'section.mop-ratings-wrap__row.js-scoreboard-container'
    );
    scoreboardContainers[0].after(imdbScoreElement);
  }

  fixCenterAlignmentOfTomatoMeterAndAudienceScore() {
    const ratingsContainers = this.document.querySelectorAll(
      'div.mop-ratings-wrap__half'
    );
    ratingsContainers.forEach((x) => (x.style.flexBasis = '100%'));
  }

  generateImdbRatingsRowElement(movieData) {
    const ratingsRowElement = this.generateEmptyRatingsRowElement();
    const metaCriticsElement = this.generateMetacriticsElement(movieData);
    const userRatingElement = this.generateUserRatingElement(movieData);

    ratingsRowElement
      .getElementsByClassName('mop-ratings-wrap__half')[0]
      .appendChild(metaCriticsElement);

    ratingsRowElement
      .getElementsByClassName('mop-ratings-wrap__half')[1]
      .appendChild(userRatingElement);

    return ratingsRowElement;
  }

  generateEmptyRatingsRowElement() {
    return this.generateElement(
      `<section id="mv-imdb-scores" class="mop-ratings-wrap__row js-scoreboard-container"` +
        `  style="border-top:2px solid #2a2c32;margin-top:30px;padding-top:20px">` +
        `  <div class="mop-ratings-wrap__half" style="flex-basis: 100%">` +
        `    </div>` +
        `  <div class="mop-ratings-wrap__half audience-score" style="flex-basis: 100%">` +
        `    </div>` +
        `</section>`
    );
  }

  generateMetacriticsElement(movieData) {
    let metacriticsOuterHtml;
    if (movieData.criticsScore) {
      metacriticsOuterHtml =
        `<a href="${movieData.url}criticreviews" class="unstyled articleLink" title="Open Critic Reviews on IMDb">` +
        `      <h2 class="mop-ratings-wrap__score">` +
        `        <span class="mop-ratings-wrap__percentage"` +
        `              style="background-color: ${movieData.criticsScore.custom}; padding: 0px 8px;">${movieData.criticsScore.score}</span></h2>` +
        `    <div class="mop-ratings-wrap__review-totals">` +
        `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
        `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
        `      <small class="mop-ratings-wrap__text--small">${movieData.criticsScore.count}</small>` +
        `    </div>` +
        `  </a>`;
    } else {
      metacriticsOuterHtml =
        `      <a href="${movieData.url}criticreviews" class="unstyled articleLink" title="Open Critic Reviews on IMDb">` +
        `        <div class="mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion"` +
        ` >There are no<br>Metacritic reviews</div>` +
        `    <div class="mop-ratings-wrap__review-totals">` +
        `      <h3 class="mop-ratings-wrap__title mop-ratings-wrap__title--small">Metascore</h3>` +
        `      <strong class="mop-ratings-wrap__text--small">Critic reviews: </strong>` +
        `      <small class="mop-ratings-wrap__text--small">N/A</small>` +
        `    </div></a>`;
    }
    const metaCriticsElement = this.generateElement(metacriticsOuterHtml);
    return metaCriticsElement;
  }

  generateUserRatingElement(movieData) {
    let userRatingElement;

    if (movieData.userScore) {
      const userratingOuterHtml =
        `<a href="${movieData.url}" class="unstyled articleLink" title="Open ${movieData.title} on IMDb">` +
        `    <h2 class="mop-ratings-wrap__score">` +
        `        <span class="mop-ratings-wrap__percentage" style="vertical-align: middle;">${movieData.userScore.score.toLocaleString(
          'en',
          {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }
        )}</span>` +
        `    </h2>` +
        `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released">` +
        `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating${this.generateToplistPositionString(
          movieData
        )}</h3>` +
        `      <strong class="mop-ratings-wrap__text--small">Number of votes: ${movieData.userScore.count.toLocaleString(
          'en'
        )}</strong>` +
        `    </div>` +
        `      </a>`;
      userRatingElement = this.generateElement(userratingOuterHtml);

      const userRatingLogo = this.generateElement(movieData.userScore.custom);
      userRatingLogo.style.verticalAlign = 'middle';
      userRatingElement.firstElementChild.prepend(userRatingLogo);
    } else {
      const userratingOuterHtml =
        `      <a href="${movieData.url}" class="unstyled articleLink" title="Open ${movieData.title} on IMDb">` +
        `  <div class="audience-score__italics mop-ratings-wrap__text--subtle mop-ratings-wrap__text--small mop-ratings-wrap__text--cushion mop-ratings-wrap__text--not-released">` +
        `        <p class="mop-ratings-wrap__prerelease-text">Coming soon</p>` +
        `    </div>` +
        `    <div class="mop-ratings-wrap__review-totals mop-ratings-wrap__review-totals--not-released">` +
        `      <h3 class="mop-ratings-wrap__title audience-score__title mop-ratings-wrap__title--small">IMDb rating</h3>` +
        `      <strong class="mop-ratings-wrap__text--small">Number of votes: N/A</strong>` +
        `    </div>` +
        `      </a>`;
      userRatingElement = this.generateElement(userratingOuterHtml);
    }

    return userRatingElement;
  }

  generateToplistPositionString(movieData) {
    return movieData.toplistPosition
      ? ` #${movieData.toplistPosition}/250`
      : ``;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(RottenPage);
}
