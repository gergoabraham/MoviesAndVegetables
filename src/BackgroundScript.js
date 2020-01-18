/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class BackgroundScript {
  static async getRemotePageData(input) {
    const {movieData, remotePage} = input;

    const responseOfSearchUrl =
                await BackgroundScript.fetchResponse(movieData, remotePage);
    const movieUrl = BackgroundScript
        .removeForwardWarning(responseOfSearchUrl.url);
    const moviePageResponse = await fetch(movieUrl);
    const moviePage = await BackgroundScript.getRemotePage(moviePageResponse);

    // eslint-disable-next-line no-undef
    const rottenPage = new RottenPage(moviePage);
    const remoteMovieData = rottenPage.getMovieData();

    remoteMovieData.url = moviePageResponse.url; // todo

    return remoteMovieData;
  };

  static async fetchResponse(movieData, remotePage) {
    const searchURL = BackgroundScript
        .constructSearchUrl(movieData, remotePage);
    return fetch(searchURL);
  };

  static constructSearchUrl(movieData, remotePage) {
    const {title, year} = movieData;

    const titleWithoutSpecialCharacters = title.replace(/&/g, '');
    return `https://www.google.com/search?btnI=true&` +
           `q=${titleWithoutSpecialCharacters}+${year}+movie+${remotePage}`
               .replace(/ /g, '+');
  };

  static removeForwardWarning(url) {
    return url.replace('https://www\.google\.com/url\?q=', '');
  };

  static async getRemotePage(response) {
    const remotePage = await response.text();

    const parser = new DOMParser();
    return parser.parseFromString(remotePage, 'text/html');
  };
}

browser.runtime.onMessage.addListener(BackgroundScript.getRemotePageData);

if (typeof module !== 'undefined') {
  module.exports = {BackgroundScript};
}

