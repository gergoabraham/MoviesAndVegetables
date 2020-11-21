/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class BackgroundScript {
  static async _getRemotePageData(message) {
    const { movieInfo, remotePageName } = message;

    Logger.log('Actual page: ', movieInfo);

    const movieUrl = await BackgroundScript._findRemoteMoviePageUrl(
      movieInfo,
      remotePageName
    );
    const remoteMovieData = await BackgroundScript._fetchMovieData(
      movieUrl,
      remotePageName
    );

    Logger.log('Remote page: ', remoteMovieData);
    Logger.updateAndLogMovieStats();

    return remoteMovieData;
  }

  static async _findRemoteMoviePageUrl(movieInfo, remotePageName) {
    const searchResponse = await BackgroundScript._fetchMovieSearch(
      movieInfo,
      remotePageName
    );
    const isSearchRedirected = BackgroundScript._isSearchRedirected(
      remotePageName,
      searchResponse
    );

    let movieUrl;

    if (isSearchRedirected) {
      movieUrl = BackgroundScript._skipRedirectNotice(searchResponse.url);

      Logger.logFetch(searchResponse.url, await searchResponse.text());
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

  static async _fetchMovieSearch(movieInfo, remotePageName) {
    const searchURL = BackgroundScript._constructSearchUrl(
      movieInfo,
      remotePageName
    );

    Logger.log('Search url: ', searchURL);

    return fetch(searchURL);
  }

  static _constructSearchUrl(movieInfo, remotePageName) {
    const { title, year } = movieInfo;
    const titleWithoutSpecialCharacters = title.replace(/&/g, '');

    return (
      `https://www.google.com/search?btnI=true&` +
      `q=${titleWithoutSpecialCharacters}+${year}` +
      `+movie+${remotePageName}`
    ).replace(/ /g, '+');
  }

  static _isSearchRedirected(remotePageName, responseOfSearch) {
    const urlPattern = MoviePageFactory.getMoviePageUrlPattern(remotePageName);

    return responseOfSearch.url.match(urlPattern);
  }

  static _skipRedirectNotice(url) {
    return url.replace('https://www.google.com/url?q=', '');
  }

  static async readMovieUrlFromSearchResults(responseOfSearch, remotePageName) {
    const urlPattern = MoviePageFactory.getMoviePageUrlPattern(remotePageName);
    const googleSearchPage = await BackgroundScript._getDOM(responseOfSearch);

    const aElements = [...googleSearchPage.getElementsByTagName('A')];
    const urls = aElements.map((elem) => elem.href);
    const movieUrls = urls.filter((href) => href && href.match(urlPattern));

    return movieUrls[0].match(urlPattern)[0];
  }

  static async _fetchMovieData(movieUrl, moviePageName) {
    const moviePageResponse = await fetch(movieUrl);
    const moviePageDOM = await BackgroundScript._getDOM(moviePageResponse);

    const remotePage = MoviePageFactory.create(
      moviePageName,
      moviePageDOM,
      moviePageResponse.url
    );

    return remotePage.getMovieInfoWithRatings();
  }

  static async _getDOM(response) {
    const text = await response.text();

    Logger.logFetch(response.url, text);

    return new DOMParser().parseFromString(text, 'text/html');
  }

  static start() {
    browser.runtime.onMessage.addListener(BackgroundScript._getRemotePageData);
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(BackgroundScript);
} else {
  BackgroundScript.start();
}
