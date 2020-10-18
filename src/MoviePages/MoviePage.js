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
   */
  constructor(document, url) {
    if (this.constructor === MoviePage) {
      throw new Error(`Class MoviePages shouldn't be instantiated.`);
    }

    this.document = document;

    const inputUrl = new URL(url);
    this.url = inputUrl.origin + inputUrl.pathname;
  }

  /**
   * @return {Movie}
   */
  async getMovieData() {
    throw new Error(`Function not implemented.`);
  }

  /**
   * @param  {Movie} movie
   */
  // eslint-disable-next-line no-unused-vars
  injectRatings(movie) {
    throw new Error(`Function not implemented.`);
  }

  readMetadataJSON() {
    const metadataRaw = this.document.head.querySelector(
      'script[type="application/ld+json"]'
    ).textContent;

    return JSON.parse(metadataRaw);
  }

  getTitleMetaTag() {
    return this.document.head.querySelector('meta[property="og:title"').content;
  }

  generateElement(innerHTML) {
    return new DOMParser().parseFromString(innerHTML, 'text/html').body
      .children[0];
  }

  getStylesheetUrl(nameRegExp) {
    const stylesheetLinkElements = this.document.querySelectorAll('link');

    const styleSheetLinks = Array.from(stylesheetLinkElements).map(
      (linkElement) => linkElement.href
    );

    const matchedStyleSheets = styleSheetLinks.filter((link) =>
      link.match(nameRegExp)
    );

    return matchedStyleSheets[0];
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(MoviePage);
}
