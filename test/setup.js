/* eslint-disable strict */

// Todo: why does strict mode have a problem with this line?
// 'should' is also undeclared, and it doesn't have any problem.
sinon = require('sinon');

'use strict';

const chai = require('chai');
should = chai.should();
const sinonChai = require('sinon-chai');
chai.use(sinonChai);


// Browser globals
global.browser = {};
global.browser.runtime = {};
global.browser.runtime.onMessage = {};
global.browser.runtime.onMessage.addedListener;
global.browser.runtime.onMessage.addListener = (listener) => {
  global.browser.runtime.onMessage.addedListener = listener;
};

// Window globals
global.window = {};
