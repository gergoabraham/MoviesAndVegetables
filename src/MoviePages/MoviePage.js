/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

/* eslint-disable valid-jsdoc */
'use strict';

class MoviePage {
  /**
   * @param  {Document} document
   * @param  {string} url
   * @param  {string} text
   */
  constructor(document, url, text) {
    if (this.constructor === MoviePage) {
      throw new Error(`Class MoviePages shouldn't be instantiated.`);
    }

    this._document = document;
    this._text = text;

    const inputUrl = new URL(url);

    this._url = inputUrl.origin + inputUrl.pathname;
  }

  static get NAME() {
    throw new Error(`Function not implemented.`);
  }

  static get URL_PATTERN() {
    throw new Error(`Function not implemented.`);
  }
  static get HOST_NAME() {
    throw new Error(`Function not implemented.`);
  }

  /**
   * @return {MovieInfo}
   */
  async getMovieInfo() {
    throw new Error(`Function not implemented.`);
  }

  /**
   * @return {MovieInfoWithRatings}
   */
  async getMovieInfoWithRatings() {
    throw new Error(`Function not implemented.`);
  }

  /**
   * @param  {MovieInfoWithRatings} movie
   */
  // eslint-disable-next-line no-unused-vars
  injectRatings(movie) {
    throw new Error(`Function not implemented.`);
  }

  _readMetadataJSON() {
    const metadataRaw = this._document.head.querySelector(
      'script[type="application/ld+json"]'
    ).textContent;

    return JSON.parse(metadataRaw);
  }

  _readDirectorFromMetadata(metaDataJSON) {
    return metaDataJSON.director
      ? metaDataJSON.director[0]
        ? metaDataJSON.director[0].name
        : metaDataJSON.director.name
      : null;
  }

  _getTitleMetaTag() {
    return this._document.head.querySelector('meta[property="og:title"')
      .content;
  }

  _generateElement(innerHTML) {
    return new DOMParser().parseFromString(innerHTML, 'text/html').body
      .children[0];
  }

  _getStylesheetUrl(nameRegExp) {
    const stylesheetLinkElements = this._document.querySelectorAll('link');

    const styleSheetLinks = Array.from(stylesheetLinkElements).map(
      (linkElement) => linkElement.href
    );

    const matchedStyleSheets = styleSheetLinks.filter((link) =>
      link.match(nameRegExp)
    );

    return matchedStyleSheets[0];
  }

  static async _fetchTextContent(url) {
    let textContent;

    if (this[url]) {
      textContent = this[url];
    } else {
      const response = await fetch(url);

      textContent = await response.text();
      this[url] = textContent;

      Logger.logFetch(url, textContent);
    }

    return textContent;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MoviePage);
}
