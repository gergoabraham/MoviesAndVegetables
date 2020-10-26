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
      css: { total: 0, count: 0 },
      imdb: { total: 0, count: 0 },
      rottenTomatoes: { total: 0, count: 0 },
      google: { total: 0, count: 0 },
    };
  }

  static updateTotalFetched(content) {
    this.fetched.total += content.length;
  }

  static updateFetchStatsPerSite(url, content) {
    if (url.match(/.+\.css$/)) {
      Logger.updateSiteStat('css', content);
    } else if (url.match(/\www\.google\.com/)) {
      Logger.updateSiteStat('google', content);
    } else if (url.match(/rottentomatoes\.com/)) {
      Logger.updateSiteStat('rottenTomatoes', content);
    } else if (url.match(/imdb\.com/)) {
      Logger.updateSiteStat('imdb', content);
    } else {
      throw new TypeError('🍅 Unknown URL!');
    }
  }

  static updateSiteStat(type, content) {
    this.fetched[type].total += content.length;
    this.fetched[type].count++;
  }

  static updateAndLogMovieStats() {
    this.movieCount = this.movieCount + 1 || 1;

    this.log(
      `Fetched:\n` +
        `\t${this.getMB(this.fetched.total)} ` +
        `- total for ${this.movieCount} movies.\t` +
        `${this.getKB(this.fetched.total / this.movieCount)} per movie\n\n` +
        Logger.generateFetchedPerSiteLogTemplate('google') +
        Logger.generateFetchedPerSiteLogTemplate('imdb') +
        Logger.generateFetchedPerSiteLogTemplate('rottenTomatoes') +
        Logger.generateFetchedPerSiteLogTemplate('css')
    );
  }

  static generateFetchedPerSiteLogTemplate(type) {
    const bytes = this.fetched[type].total;
    const count = this.fetched[type].count;

    return (
      `\t${this.getMB(bytes)}` +
      `\t${((bytes / this.fetched.total) * 100).toFixed(0)}%` +
      `\t${count}x` +
      `\tavg: ${this.getKB(bytes / count || 0)}` +
      `\t${type}` +
      '\n'
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
