/**
 * Movies and Vegetables
 *
 * @author Gergő Ábrahám (abrahamgergo@gmail.com)
 */

'use strict';

class Summary {
  /**
   * @param  {string} title
   * @param  {string} content
   */
  constructor(title, content) {
    this.title = title;
    this.content = content;
  }
}

if (typeof exportToTestEnvironment !== 'undefined') {
  exportToTestEnvironment(Summary);
}
