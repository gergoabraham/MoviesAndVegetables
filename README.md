Master/release: [![CircleCI](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/master.svg?style=svg&circle-token=deac9a2ced9ed3937ff44eb0f9cf3f63aa6bff08)](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/master)  [![codecov](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/master/graph/badge.svg?token=nUY2twqHRv)](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/master)
Develop: [![CircleCI](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/develop.svg?style=svg&circle-token=deac9a2ced9ed3937ff44eb0f9cf3f63aa6bff08)](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/develop)  [![codecov](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/develop/graph/badge.svg?token=nUY2twqHRv)](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/develop)
Latest commit: [![CircleCI](https://circleci.com/gh/gergooo/MoviesAndVegetables.svg?style=svg&circle-token=deac9a2ced9ed3937ff44eb0f9cf3f63aa6bff08)](https://circleci.com/gh/gergooo/MoviesAndVegetables)

# Movies and Vegetables ![Icon](src/icons/icon-48.png)
A Firefox extension.

## Description
**Please consider that this extension is currently under development. New features will be implemented and released continuously.**

Do you like to check out a movie both on IMDb and RottenTomatoes when you're searching for tonight's entertainment?

But do you hate to do all the searches **TWICE**? Once for RottenTomatoes, once for IMDb...

Look no further then! This extension can **spare your time** by searching for the movies' other page automatically! Moreover, you can see **all the scores** on IMDb in a nicely blended way.

### Current features
- Shows a movie's Tomatometer and AudienceScore on its IMDb page,
- Clicking on the Tomatometer or AudienceScore forwards you to the movie's RottenTomatoes page.

### Coming soon!
- Shows a movie's Metascore and User score on RottenTomatoes,
- Switches between the movie's IMDb and RottenTomatoes page with a hotkey.

### Release log
- v0.1: First release, showing RottenTomatoes scores on IMDb.

### Support
Please write a mail [to this address](mailto:sw.gergo.abraham@gmail.com) if you find any issue, or have a feature request.

## Development notes
### Scripts
- `npm run tdd` - for TDD. :-)
- `npm test` - to use before commit. Runs unit tests, eslint, web-ext lint and coverage.
- `npm run firefox` - for testing the extension in Firefox.
- `npm run fix-eslint`- runs ESLint, and also fixes errors that ESLint can fix automatically.

### Branching
- `master` - production-ready state,
- `develop` - integration branch,
- `feature branches` - for features.

## Sources
The example test environment in the [webextensions-jsdom](https://github.com/webexts/webextensions-jsdom) github repo was a huge help when starting this project.

Branching strategy is based on the great [article](https://nvie.com/posts/a-successful-git-branching-model/) of Vincent Driessen.

## Disclaimer
This extension is neither a robot, nor a crawler. It is a simple browser extension that spares some mouse clicks for the user, triggered by the user's actions, and visualizes the result in a simple way.

`testImdbPage-*.html` are unmodified copies of movie's and series' IMDb pages, I do not own them. They are the intellectual properties of their owners, and the sole purpose of storing them is to be able to test the web extension without downloading the pages from the internet every time. So we can say, that those are practically cached pages.

`testRottenTomatoesPage.html` is an unmodified copy of a movie's RottenTomatoes page, I do not own it. Same, as above.
