'use strict';

const chai = require('chai');
should = chai.should();

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
