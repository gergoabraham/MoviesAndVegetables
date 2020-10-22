/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class BackgroundScript {
  static async getRemotePageData(message) {
    const { movie, remotePageName } = message;
    Logger.log('Actual page: ', movie);

    const movieUrl = await BackgroundScript.findRemoteMoviePageUrl(
      movie,
      remotePageName
    );
    const remoteMovieData = await BackgroundScript.fetchMovieData(
      movieUrl,
      remotePageName
    );

    Logger.log('Remote page: ', remoteMovieData);
    return remoteMovieData;
  }

  static async findRemoteMoviePageUrl(movie, remotePageName) {
    const searchResponse = await BackgroundScript.fetchMovieSearch(
      movie,
      remotePageName
    );
    const isSearchRedirected = BackgroundScript.isSearchRedirected(
      remotePageName,
      searchResponse
    );

    let movieUrl;
    if (isSearchRedirected) {
      movieUrl = BackgroundScript.skipRedirectNotice(searchResponse.url);
      Logger.log('feeling lucky 😎', movieUrl);
    } else {
      movieUrl = await BackgroundScript.readMovieUrlFromSearchResults(
        searchResponse,
        remotePageName
      );
      Logger.log('feeling unlucky 😥', movieUrl);
    }

    return movieUrl;
  }

  static async fetchMovieSearch(movie, remotePageName) {
    const searchURL = BackgroundScript.constructSearchUrl(
      movie,
      remotePageName
    );
    Logger.log('Search url: ', searchURL);

    return fetch(searchURL);
  }

  static constructSearchUrl(movie, remotePageName) {
    const { title, year } = movie.info;
    const titleWithoutSpecialCharacters = title.replace(/&/g, '');

    return (
      `https://www.google.com/search?btnI=true&` +
      `q=${titleWithoutSpecialCharacters}+${year}` +
      `+movie+${remotePageName}`
    ).replace(/ /g, '+');
  }

  static isSearchRedirected(remotePageName, responseOfSearch) {
    const urlPattern = MoviePageFactory.getMoviePageUrlPattern(remotePageName);
    return responseOfSearch.url.match(urlPattern);
  }

  static skipRedirectNotice(url) {
    return url.replace('https://www.google.com/url?q=', '');
  }

  static async readMovieUrlFromSearchResults(responseOfSearch, remotePageName) {
    const urlPattern = MoviePageFactory.getMoviePageUrlPattern(remotePageName);
    const googleSearchPage = await BackgroundScript.getDOM(responseOfSearch);

    const aElements = [...googleSearchPage.getElementsByTagName('A')];
    const urls = aElements.map((elem) => elem.href);
    const movieUrls = urls.filter((href) => href && href.match(urlPattern));

    return movieUrls[0].match(urlPattern)[0];
  }

  static async fetchMovieData(movieUrl, moviePageName) {
    const moviePageResponse = await fetch(movieUrl);
    const moviePageDOM = await BackgroundScript.getDOM(moviePageResponse);

    const remotePage = MoviePageFactory.create(
      moviePageName,
      moviePageDOM,
      moviePageResponse.url
    );

    return remotePage.getMovieInfoWithRatings();
  }

  static async getDOM(response) {
    const text = await response.text();
    return new DOMParser().parseFromString(text, 'text/html');
  }

  static init() {
    browser.runtime.onMessage.addListener(BackgroundScript.getRemotePageData);
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(BackgroundScript);
} else {
  BackgroundScript.init();
}
