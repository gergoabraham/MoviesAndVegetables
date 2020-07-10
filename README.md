Master/release: [![CircleCI](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/master.svg?style=svg&circle-token=deac9a2ced9ed3937ff44eb0f9cf3f63aa6bff08)](https://circleci.com/gh/gergooo/workflows/MoviesAndVegetables/tree/master)  [![codecov](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/master/graph/badge.svg?token=nUY2twqHRv)](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/master)
Develop: [![CircleCI](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/develop.svg?style=svg&circle-token=deac9a2ced9ed3937ff44eb0f9cf3f63aa6bff08)](https://circleci.com/gh/gergooo/workflows/MoviesAndVegetables/tree/develop)  [![codecov](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/develop/graph/badge.svg?token=nUY2twqHRv)](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/develop)

# Movies and Vegetables ![Icon](src/icons/icon-48.png)
[![Version](https://img.shields.io/amo/v/movies-and-vegetables)](https://addons.mozilla.org/hu/firefox/addon/movies-and-vegetables/)
[![Downloads](https://img.shields.io/amo/dw/movies-and-vegetables)](https://addons.mozilla.org/hu/firefox/addon/movies-and-vegetables/)
[![Users](https://img.shields.io/amo/users/movies-and-vegetables)](https://addons.mozilla.org/hu/firefox/addon/movies-and-vegetables/)
[![Rating](https://img.shields.io/amo/rating/movies-and-vegetables)](https://addons.mozilla.org/hu/firefox/addon/movies-and-vegetables/)

## Description
<b>Please consider that this extension is currently being under development. New features are being implemented and released continuously. There are also some known issues.</b> Nothing serious though, it simply doesn't find some movies, and doesn't look nice in some cases.

Do you like to check out a movie both on IMDb and RottenTomatoes when you're searching for tonight's entertainment?

But do you hate to do all the searches <b>TWICE</b>? Once for RottenTomatoes, once for IMDb...

Look no further then! This extension can <b>spare your time</b> by searching for the movies' other page automatically! Moreover, you can see <b>all the scores</b> on IMDb in a nicely blended way.

<b>Current features</b>
- Shows a movie's Tomatometer and AudienceScore on its IMDb page,
- Shows a movie's Metascore and User score on RottenTomatoes,
- and also the TOP250 position.
- You can navigate to the other page via the inserted movie scores.

<b>Coming soon!</b>
- Improvements, bugfixes,
- Option to switch between the movie's IMDb and RottenTomatoes page with a hotkey.
- Maybe showing scores on list views.

<b>Release log</b>
- v0.1.0: First release, showing RottenTomatoes scores on IMDb.
- v0.1.1: Icon is updated.
- v0.1.2: Number formatting is based on the browser's preferred language, just like on IMDb.
- v0.1.3: Bugfix to make the extension working again.
- v0.2.0: <b>RottenTomatoes now shows the IMDb scores!</b> Even the <b>TOP250</b> position is displayed!

<b>Why does this extension need access for my data on IMDb, RottenTomatoes and especially on Google?</b>
First, the extension modifies the currently viewed IMDb (and in the next release the RottenTomatoes) page by adding the score.
Second, it does the same what you would do: searches for the movie's pages in Google and opens its RottenTomatoes page in the background to get the scores. The given permissions are needed to make the extension be able to do this. (In the future, this may be changed to use some movie database API.)

<b>Support</b> 
Please write a mail to the following address if you find any issue, or have a feature request: sw.gergo.abraham@gmail.com

<b>Donation</b> 
If you like this extension, please <a href="https://www.buymeacoffee.com/gergoabraham">buy me a coffee</a> or <a href="https://www.patreon.com/gergoabraham">become my patron</a>. ◕ ◡ ◕

## Development notes
### Scripts
- `npm run tdd` - for TDD. :-)
- `npm test` - to use before commit. Runs unit tests, eslint, web-ext lint and coverage.
- `npm run firefox` - for testing the extension in Firefox.
- `npm run fix-eslint`- runs ESLint, and also fixes errors that ESLint can fix automatically.
- `npm run build` - builds extension for publishing on AMO.

### Branching
- `master` - production-ready state,
- `develop` - integration branch,
- `feature branches` - for features.

## Sources
The example test environment in the [webextensions-jsdom](https://github.com/webexts/webextensions-jsdom) github repo was a huge help when starting this project.

Branching strategy is based on the great [article](https://nvie.com/posts/a-successful-git-branching-model/) of Vincent Driessen.

The Firefox Add-on related **badges** are hosted by [Shields.io](https://shields.io/).

## Disclaimer
This extension is neither a robot, nor a crawler. It is a simple browser extension that spares some mouse clicks for the user, triggered by the user's actions, and visualizes the result in a simple way.

`testImdbPage-*.html` are unmodified copies of movie's and series' IMDb pages, I do not own them. They are the intellectual properties of their owners, and the sole purpose of storing them is to be able to test the web extension without downloading the pages from the internet every time. So we can say, that those are practically cached pages.

`testRottenTomatoesPage.html` is an unmodified copy of a movie's RottenTomatoes page, I do not own it. Same, as above.
