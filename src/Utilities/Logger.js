/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class Logger {
  static log(message, ...optionalParams) {
    if (this.isAddonTemporary()) {
      console.log(message, ...optionalParams);
    }
  }

  static isAddonTemporary() {
    return browser.runtime.id.match(/@temporary-addon/);
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(Logger);
}
