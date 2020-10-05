Master/release: [![CircleCI](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/master.svg?style=svg&circle-token=deac9a2ced9ed3937ff44eb0f9cf3f63aa6bff08)](https://circleci.com/gh/gergooo/workflows/MoviesAndVegetables/tree/master) [![codecov](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/master/graph/badge.svg?token=nUY2twqHRv)](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/master)
Develop: [![CircleCI](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/develop.svg?style=svg&circle-token=deac9a2ced9ed3937ff44eb0f9cf3f63aa6bff08)](https://circleci.com/gh/gergooo/workflows/MoviesAndVegetables/tree/develop) [![codecov](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/develop/graph/badge.svg?token=nUY2twqHRv)](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/develop)

# Movies and Vegetables ![Icon](src/icons/icon-48.png)

[![Version](https://img.shields.io/amo/v/movies-and-vegetables)](https://addons.mozilla.org/hu/firefox/addon/movies-and-vegetables/)
[![Downloads](https://img.shields.io/amo/dw/movies-and-vegetables)](https://addons.mozilla.org/hu/firefox/addon/movies-and-vegetables/)
[![Users](https://img.shields.io/amo/users/movies-and-vegetables)](https://addons.mozilla.org/hu/firefox/addon/movies-and-vegetables/)
[![Rating](https://img.shields.io/amo/rating/movies-and-vegetables)](https://addons.mozilla.org/hu/firefox/addon/movies-and-vegetables/)

## Description

Do you like to check out a movie both on <b>IMDb</b> and <b>RottenTomatoes</b> when you're searching for tonight's entertainment? But you hate to do all the searches twice... This extension might help you. =)

<b>With this extension, you can</b>

- check out a movie's RottenTomatoes <b>Tomatometer</b> and <b>AudienceScore</b> on <b>IMDb</b>,
- or its IMDb <b>User score</b> and <b>Metascore</b> on <b>RottenTomatoes</b>, and even the <b>TOP250 position</b>!

<b>Please consider that this extension is currently under development, there is a lot missing. New features are being implemented and released continuously.</b>

<b>Why does this extension need access for my data on IMDb, RottenTomatoes and especially on Google?</b>
First, the extension modifies the currently viewed IMDb/RottenTomatoes page by adding the scores.
Second, it does the same what you would do: searches for the movie's pages in Google and opens its RottenTomatoes page in the background to get the scores. The given permissions are needed to make the extension be able to do this. (In the future, this may be changed to use some movie database API.)

<b>Support</b>

Please write a mail to the following address if you find any issue, or have a feature request: sw.gergo.abraham@gmail.com

<b>Donation</b>

If you like this extension, please <a href="https://www.buymeacoffee.com/gergoabraham">buy me a coffee</a> or <a href="https://www.patreon.com/gergoabraham">become my patron</a>. ◕ ◡ ◕

## Development notes

### Branching

- `master` - released version - daily tests are performed on this branch,
- `develop` - integration branch,
- `feature branches` - for features.

## Sources

The example test environment in the [webextensions-jsdom](https://github.com/webexts/webextensions-jsdom) github repo was a huge help when starting this project.

Branching strategy is based on the great [article](https://nvie.com/posts/a-successful-git-branching-model/) of Vincent Driessen.

The Firefox Add-on related **badges** are hosted by [Shields.io](https://shields.io/).

## Disclaimer

This extension is neither a robot, nor a crawler. It is a simple browser extension that spares some mouse clicks for the user, triggered by the user's actions, and visualizes the result in a simple way.
