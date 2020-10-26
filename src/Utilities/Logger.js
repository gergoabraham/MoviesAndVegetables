/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class Logger {
  static log(message, ...optionalParams) {
    if (this.isAddonTemporary()) {
      console.log('🎥🍅', message, ...optionalParams);
    }
  }

  static logFetch(url, content) {
    if (this.isAddonTemporary()) {
      Logger.initFetchStats();
      Logger.updateTotalFetched(content);
      Logger.updateFetchStatsPerSite(url, content);

      this.log(
        `Fetched ${url} with size ${this.getKB(
          content.length
        )}. Fetched ${this.getMB(this.fetched.total)} so far.`
      );
    }
  }

  static isAddonTemporary() {
    return browser.runtime.id.match(/@temporary-addon/);
  }

  static initFetchStats() {
    this.fetched = this.fetched || {
      total: 0,
      css: 0,
      imdb: 0,
      rottenTomatoes: 0,
      google: 0,
    };
  }

  static updateTotalFetched(content) {
    this.fetched.total += content.length;
  }

  static updateFetchStatsPerSite(url, content) {
    if (url.match(/.+\.css$/)) {
      this.fetched.css += content.length;
    } else if (url.match(/\www\.google\.com/)) {
      this.fetched.google += content.length;
    } else if (url.match(/rottentomatoes\.com/)) {
      this.fetched.rottenTomatoes += content.length;
    } else if (url.match(/imdb\.com/)) {
      this.fetched.imdb += content.length;
    } else {
      throw new TypeError('🍅 Unknown URL!');
    }
  }

  static updateAndLogMovieStats() {
    this.movieCount = this.movieCount + 1 || 1;

    this.log(
      `Fetched:\n` +
        `\t${this.getMB(this.fetched.total)} ` +
        `- total for ${this.movieCount} movies.\n\n` +
        Logger.generateFetchedPerSiteLogTemplate('google') +
        Logger.generateFetchedPerSiteLogTemplate('imdb') +
        Logger.generateFetchedPerSiteLogTemplate('rottenTomatoes') +
        Logger.generateFetchedPerSiteLogTemplate('css')
    );
  }

  static generateFetchedPerSiteLogTemplate(type) {
    const bytes = this.fetched[type];

    return (
      `\t${this.getMB(bytes)}` +
      `\t\tavg: ${this.getKB(bytes / this.movieCount)}` +
      `\t${((bytes / this.fetched.total) * 100).toFixed(0)}%` +
      `\t${type}\n`
    );
  }

  static getKB(bytes) {
    return (bytes / 2 ** 10).toFixed(1) + ' KB';
  }

  static getMB(bytes) {
    return (bytes / 2 ** 20).toFixed(1) + ' MB';
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(Logger);
}
