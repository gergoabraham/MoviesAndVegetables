/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

window.getRottenData = async (movieData) => {
  const remotePage = `Rotten Tomatoes`;
  const responseOfSearchUrl =
              await window.fetchRottenResponse(movieData, remotePage);
  const movieUrl = window.removeForwardWarning(responseOfSearchUrl.url);
  const moviePageResponse = await fetch(movieUrl);
  const moviePage = await window.getRottenPage(moviePageResponse);

  return {...window.readRottenData(moviePage), url: moviePageResponse.url};
};

window.fetchRottenResponse = async (movieData, remotePage) => {
  const searchURL =
    window.constructSearchUrlForRotten(movieData, remotePage);
  return fetch(searchURL);
};

window.constructSearchUrlForRotten = (movieData, where) => {
  const {title, year} = movieData;

  const titleWithoutSpecialCharacters = title.replace(/&/g, '');
  return `https://www.google.com/search?btnI=true&` +
         `q=${titleWithoutSpecialCharacters}+${year}+movie+${where}`
             .replace(/ /g, '+');
};

window.removeForwardWarning = function(url) {
  return url.replace('https://www\.google\.com/url\?q=', '');
};

window.getRottenPage = async (response) => {
  const rottenPage = await response.text();

  const parser = new DOMParser();
  return parser.parseFromString(rottenPage, 'text/html');
};

browser.runtime.onMessage.addListener(window.getRottenData);
