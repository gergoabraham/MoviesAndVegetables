/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class Logger {
  static log(message, ...optionalParams) {
    if (this.isAddonTemporary()) {
      // eslint-disable-next-line no-console
      console.log('🎥🍅', message, ...optionalParams);
    }
  }

  static logFetch(url, content) {
    if (this.isAddonTemporary()) {
      Logger._initFetchStats();
      Logger._updateTotalFetched(content);
      Logger._updateFetchStatsPerSite(url, content);

      this.log(
        `Fetched ${url} with size ${this._getKB(
          content.length
        )}. Fetched ${this._getMB(this._fetched.total)} so far.`
      );
    }
  }

  static isAddonTemporary() {
    return browser.runtime.id.match(/@temporary-addon/);
  }

  static _initFetchStats() {
    this._fetched = this._fetched || {
      total: 0,
      css: { total: 0, count: 0 },
      imdb: { total: 0, count: 0 },
      rottenTomatoes: { total: 0, count: 0 },
      google: { total: 0, count: 0 },
    };
  }

  static _updateTotalFetched(content) {
    this._fetched.total += content.length;
  }

  static _updateFetchStatsPerSite(url, content) {
    if (url.match(/.+\.css$/)) {
      Logger._updateSiteStat('css', content);
    } else if (url.match(/\www\.google\.com/)) {
      Logger._updateSiteStat('google', content);
    } else if (url.match(/rottentomatoes\.com/)) {
      Logger._updateSiteStat('rottenTomatoes', content);
    } else if (url.match(/imdb\.com/)) {
      Logger._updateSiteStat('imdb', content);
    } else {
      throw new TypeError('🍅 Unknown URL!');
    }
  }

  static _updateSiteStat(type, content) {
    this._fetched[type].total += content.length;
    this._fetched[type].count++;
  }

  static updateAndLogMovieStats() {
    if (this.isAddonTemporary()) {
      this._movieCount = this._movieCount + 1 || 1;

      this.log(
        `Fetched:\n` +
          `\t${this._getMB(this._fetched.total)} ` +
          `- total for ${this._movieCount} movies.\t` +
          `${this._getKB(
            this._fetched.total / this._movieCount
          )} per movie\n\n` +
          Logger._generateFetchedPerSiteLogTemplate('google') +
          Logger._generateFetchedPerSiteLogTemplate('imdb') +
          Logger._generateFetchedPerSiteLogTemplate('rottenTomatoes') +
          Logger._generateFetchedPerSiteLogTemplate('css')
      );
    }
  }

  static _generateFetchedPerSiteLogTemplate(type) {
    const bytes = this._fetched[type].total;
    const count = this._fetched[type].count;

    return (
      `\t${this._getMB(bytes)}` +
      `\t${((bytes / this._fetched.total) * 100).toFixed(0)}%` +
      `\t${count}x` +
      `\tavg: ${this._getKB(bytes / count || 0)}` +
      `\t${type}` +
      '\n'
    );
  }

  static _getKB(bytes) {
    return (bytes / 2 ** 10).toFixed(1) + ' KB';
  }

  static _getMB(bytes) {
    return (bytes / 2 ** 20).toFixed(1) + ' MB';
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(Logger);
}
