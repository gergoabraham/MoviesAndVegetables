[![CircleCI](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/rotten-score-on-imdb.svg?style=svg&circle-token=deac9a2ced9ed3937ff44eb0f9cf3f63aa6bff08)](https://circleci.com/gh/gergooo/MoviesAndVegetables/tree/rotten-score-on-imdb)  [![codecov](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/rotten-score-on-imdb/graph/badge.svg?token=nUY2twqHRv)](https://codecov.io/gh/gergooo/MoviesAndVegetables/branch/rotten-score-on-imdb)


# Movies and Vegetables
A Firefox extension.

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

`testImdbPage.html` is an unmodified copy of a movie's IMDb page, I do not own it. It is the intellectual property of its owners, and the sole purpose of storing it is to be able to test the web extension without downloading the page from the internet every time. So we can say, that it is practically a cached page.

`testRottenTomatoesPage.html` is an unmodified copy of a movie's RottenTomatoes page, I do not own it. Same, as above.
