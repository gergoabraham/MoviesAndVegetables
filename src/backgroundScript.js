'use strict';

window.getRottenData = async (movieData) => {
  const remotePage = `Rotten Tomatoes`;
  const response = await window.fetchRottenResponse(movieData, remotePage);
  const rottenPage = await window.getRottenPage(response);

  return {...window.readRottenData(rottenPage), url: response.url};
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

window.getRottenPage = async (response) => {
  const rottenPage = await response.text();

  const parser = new DOMParser();
  return parser.parseFromString(rottenPage, 'text/html');
};

browser.runtime.onMessage.addListener(window.getRottenData);
