/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

window.getRemotePageData = async (input) => {
  const {movieData, remotePage} = input;

  const responseOfSearchUrl =
              await window.fetchResponse(movieData, remotePage);
  const movieUrl = window.removeForwardWarning(responseOfSearchUrl.url);
  const moviePageResponse = await fetch(movieUrl);
  const moviePage = await window.getRemotePage(moviePageResponse);

  return {...window.readRottenData(moviePage), url: moviePageResponse.url};
};

window.fetchResponse = async (movieData, remotePage) => {
  const searchURL =
    window.constructSearchUrl(movieData, remotePage);
  return fetch(searchURL);
};

window.constructSearchUrl = (movieData, remotePage) => {
  const {title, year} = movieData;

  const titleWithoutSpecialCharacters = title.replace(/&/g, '');
  return `https://www.google.com/search?btnI=true&` +
         `q=${titleWithoutSpecialCharacters}+${year}+movie+${remotePage}`
             .replace(/ /g, '+');
};

window.removeForwardWarning = function(url) {
  return url.replace('https://www\.google\.com/url\?q=', '');
};

window.getRemotePage = async (response) => {
  const remotePage = await response.text();

  const parser = new DOMParser();
  return parser.parseFromString(remotePage, 'text/html');
};

browser.runtime.onMessage.addListener(window.getRemotePageData);
