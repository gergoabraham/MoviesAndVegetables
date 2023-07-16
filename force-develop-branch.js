'use strict';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function forceDevelopBranch() {
  const { stdout: currentBranch } = await exec('git branch --show-current');

  if (currentBranch !== 'develop\n') {
    throw Error('⚠️ Version should be generated only on develop branch! ⚠️');
  }
}

return forceDevelopBranch();
