/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function generateChangelog() {
  const { stdout: rawVersionOutput } = await exec(
    "git tag --format='%(refname:short):::%(creatordate:short):::%(subject)' --sort=-refname"
  );

  const rawTags = rawVersionOutput.split('\n').filter((x) => x.length > 0);

  const changelog = rawTags.map((rawTag) => {
    const tagFields = rawTag.replace(/^'|'$/g, '').split(':::');

    return {
      version: tagFields[0],
      date: tagFields[1],
      description: tagFields[2],
    };
  });

  const newVersion = {
    version: process.env.npm_package_version,
    date: new Date().toISOString().substring(0, 10),
    description: process.env.npm_config_message,
  };

  changelog.unshift(newVersion);

  fs.writeFileSync('changelog.json', JSON.stringify(changelog, null, ' '));
}

generateChangelog();
