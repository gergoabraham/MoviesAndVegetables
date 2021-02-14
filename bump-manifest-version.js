'use strict';

const fs = require('fs');

async function bumpManifestVersion() {
  const manifest = fs.readFileSync('src/manifest.json').toString();

  const updatedManifest = manifest.replace(
    /(?<="version": ")\d+\.\d+\.\d+/,
    process.env.npm_package_version
  );

  fs.writeFileSync('src/manifest.json', updatedManifest);
}

bumpManifestVersion();
